/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useRef } from 'react';
import { DEFAULT_SPRITES, getSpriteMatrix } from '../utils/nyanRenderer';
import { detectInitialLang, tFor } from '../i18n';

export const AppContext = createContext();

const LOCAL_STORAGE_KEY = 'nyan_studio_project_data';

// Initial default settings
const INITIAL_SETTINGS = {
  fps: 24,
  scale: 6,
  starDensity: 40,
  skinStyle: 'classic',
  poptartStyle: 'strawberry',
  rainbowStyle: 'classic',
  movementMode: 'crosser',
  headDx: 12,
  headDy: 0,
  customFrostingColor: '#ff66cc',
  customCrustColor: '#ffa659',
  customSprinkleColor: '#ff007f',
  trail: {
    enabled: true,
    spacing: 6,
    waveType: 'blocky',
    waveAmplitude: 1,
    animationDivisor: 4
  },
  language: detectInitialLang()
};

export const AppProvider = ({ children }) => {
  const liveEditingPartRef = useRef({ key: '', data: null });
  const [toastMessage, setToastMessage] = useState('');

  // Helper to safely parse localStorage on load
  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (e) {
      console.error('Failed to parse saved data from localStorage:', e);
    }
    return null;
  };

  // Helper to load layers/background/resolution from active profile if possible, otherwise fallback
  const getInitialLayers = (initData) => {
    try {
      const savedActiveId = localStorage.getItem('nyan_studio_active_profile_id');
      const savedProfiles = localStorage.getItem('nyan_studio_assembler_profiles');
      if (savedActiveId && savedProfiles) {
        const parsedProfiles = JSON.parse(savedProfiles);
        if (parsedProfiles[savedActiveId]) {
          return parsedProfiles[savedActiveId].layers || [];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return initData.layers || [];
  };

  const getInitialBackground = (initData) => {
    try {
      const savedActiveId = localStorage.getItem('nyan_studio_active_profile_id');
      const savedProfiles = localStorage.getItem('nyan_studio_assembler_profiles');
      if (savedActiveId && savedProfiles) {
        const parsedProfiles = JSON.parse(savedProfiles);
        if (parsedProfiles[savedActiveId]) {
          return parsedProfiles[savedActiveId].background || { type: 'transparent', value: '' };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return initData.background || { type: 'transparent', value: '' };
  };

  const initialData = loadSavedData() || {};
  const [systemProfileData, setSystemProfileData] = useState(null);

  // 1. Custom Parts Library (User-drawn pixel art parts)
  // Structured as: { [partName]: { name: string, width: number, height: number, data: 2D array, package?: string } }
  const [customParts, setCustomParts] = useState(() => {
    const raw = initialData.customParts || {};
    const upgraded = {};
    Object.keys(raw).forEach((k) => {
      const part = raw[k];
      // Migrate legacy format: data → matrix, palette → colors
      const matrix = part.matrix || part.data;
      const colors = part.colors || part.palette || null;
      upgraded[k] = {
        ...part,
        matrix,
        colors,
        package: part.package || 'My Custom'
      };
      // Remove legacy fields to keep data clean
      delete upgraded[k].data;
      delete upgraded[k].palette;
    });
    return upgraded;
  });

  // 1.5 Custom Color Palettes state (Imported by user)
  // Structured as: { [paletteName]: { 1: string, 2: string, ... } }
  const [customPalettes, setCustomPalettes] = useState(() => {
    try {
      const saved = localStorage.getItem('nyan_studio_custom_palettes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  // Sync customPalettes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nyan_studio_custom_palettes', JSON.stringify(customPalettes));
    } catch (e) {
      console.error('Failed to save custom palettes:', e);
    }
  }, [customPalettes]);

  // Loaded Packages state
  const [loadedPackages, setLoadedPackages] = useState(() => {
    try {
      const saved = localStorage.getItem('nyan_studio_loaded_packages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.includes('Nyan Cat')) {
          parsed.unshift('Nyan Cat');
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return ['Nyan Cat'];
  });

  // Sync loadedPackages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nyan_studio_loaded_packages', JSON.stringify(loadedPackages));
    } catch (e) {
      console.error('Failed to save loaded packages:', e);
    }
  }, [loadedPackages]);

  // 2. Layers for Widescreen Drag & Drop Assembler
  // Structured as: Array of { id: string, partName: string, x: number, y: number, zIndex: number, visible: boolean }
  const [layers, setLayers] = useState(() => getInitialLayers(initialData));

  // 3. Custom Canvas Background
  // Structured as: { type: 'transparent' | 'color' | 'image', value: string }
  const [background, setBackground] = useState(() => getInitialBackground(initialData));

  // 6. Profiles for Widescreen Drag & Drop Assembler
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('nyan_studio_assembler_profiles');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    return localStorage.getItem('nyan_studio_active_profile_id') || null;
  });

  const [resolution, setResolution] = useState(() => {
    try {
      const savedActiveId = localStorage.getItem('nyan_studio_active_profile_id');
      const savedProfiles = localStorage.getItem('nyan_studio_assembler_profiles');
      if (savedActiveId && savedProfiles) {
        const parsedProfiles = JSON.parse(savedProfiles);
        if (parsedProfiles[savedActiveId]) {
          return parsedProfiles[savedActiveId].resolution || { width: 1920, height: 462 };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return { width: 1920, height: 462 };
  });

  // 4. Motion / Animation Bindings for Nyan Cat
  // Maps a standard Nyan dynamic slot (e.g. 'HEAD_OPEN') to a user's custom part key
  const [bindings, setBindings] = useState(initialData.bindings || {
    HEAD_OPEN: 'default',
    POPTART: 'default',
    TAIL_UP: 'default',
    TAIL_MID: 'default',
    TAIL_DOWN: 'default',
    LEG_DOWN: 'default',
    LEG_FRONT: 'default',
    LEG_BACK: 'default',
    TRAIL: 'default'
  });

  // 4.5 Default System Sprites loaded dynamically from JSON
  const [defaultSprites, setDefaultSprites] = useState(DEFAULT_SPRITES);

  useEffect(() => {
    fetch('/defaultSprites.json?t=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setDefaultSprites(data);
        }
      })
      .catch((err) => {
        console.error('Failed to dynamically load default sprites:', err);
      });
  }, []);

  // 5. General simulation settings
  const [settings, setSettings] = useState(
    initialData.settings ? { ...INITIAL_SETTINGS, ...initialData.settings } : INITIAL_SETTINGS
  );

  // Load default model dynamically on start
  useEffect(() => {
    fetch('/defaultProject.json?t=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSystemProfileData({
            id: 'system_default',
            name: 'Classic Nyan Cat',
            resolution: { width: 1920, height: 462 },
            layers: data.layers || [],
            background: data.background || { type: 'starfield', value: '' },
            settings: data.settings || {},
            bindings: data.bindings || {},
            isSystem: true
          });

          // Fallback init if localStorage is completely empty
          const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (!savedData) {
            console.log('No user project in localStorage. Dynamically loading default model...');
            if (data.customParts) {
              const upgraded = {};
              Object.keys(data.customParts).forEach((k) => {
                const part = data.customParts[k];
                const matrix = part.matrix || part.data;
                const colors = part.colors || part.palette || null;
                upgraded[k] = {
                  ...part,
                  matrix,
                  colors,
                  package: part.package || 'My Custom'
                };
                delete upgraded[k].data;
                delete upgraded[k].palette;
              });
              setCustomParts(upgraded);
            }
            if (data.layers) setLayers(data.layers);
            if (data.background) setBackground(data.background);
            if (data.bindings) setBindings(data.bindings);
            if (data.settings) setSettings({ ...INITIAL_SETTINGS, ...data.settings });
          }
        }
      })
      .catch((err) => {
        console.error('Failed to dynamically load default model:', err);
      });
  }, []);

  // Auto-dismiss toast messages after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Sync to LocalStorage when any state changes
  useEffect(() => {
    if (Object.keys(customParts).length === 0 && layers.length === 0) return; // avoid wiping on init
    const projectData = {
      customParts,
      layers,
      background,
      bindings,
      settings
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectData));
    } catch (e) {
      console.error('Failed to save project to localStorage:', e);
    }
  }, [customParts, layers, background, bindings, settings]);

  // --- ACTIONS ---

  // Update a single setting parameter
  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const t = (key, vars) => tFor(settings.language, key, vars);

  const saveCustomPart = (name, width, height, matrix, packageName = 'My Custom', colors = null, colorLabels = null, isAnimationFrameOnly = false) => {
    const key = name.trim().replace(/\s+/g, '_').toLowerCase();
    const pkg = packageName.trim() || 'My Custom';
    setCustomParts((prev) => ({
      ...prev,
      [key]: {
        name: name.trim(),
        width,
        height,
        matrix,
        package: pkg,
        isAnimationFrameOnly,
        ...(colors ? { colors } : {}),
        ...(colorLabels ? { colorLabels } : {})
      }
    }));
    // Auto-load the package
    setLoadedPackages((prev) => {
      if (!prev.includes(pkg)) {
        return [...prev, pkg];
      }
      return prev;
    });
    return key;
  };

  // Load / Import custom palette from JSON
  const importCustomPalette = (paletteName, colors, labels = null) => {
    const colorsObj = colors.colors ? colors.colors : colors;
    const labelsObj = colors.labels ? colors.labels : (labels || {});
    setCustomPalettes((prev) => ({
      ...prev,
      [paletteName]: {
        colors: colorsObj,
        labels: labelsObj
      }
    }));
  };

  // Delete custom palette from library
  const deleteCustomPalette = (paletteName) => {
    setCustomPalettes((prev) => {
      const copy = { ...prev };
      delete copy[paletteName];
      return copy;
    });
  };

  // Delete a custom part from library
  const deleteCustomPart = (key) => {
    setCustomParts((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    // Clean up any bindings pointing to this part
    setBindings((prev) => {
      const nextBindings = { ...prev };
      Object.keys(nextBindings).forEach((slot) => {
        if (nextBindings[slot] === key) {
          nextBindings[slot] = 'default';
        }
      });
      return nextBindings;
    });

    // Clean up any layers using this part
    setLayers((prev) => prev.filter((layer) => layer.partName !== key));
  };

  // Package Management Actions
  const loadPackage = (packageName) => {
    setLoadedPackages((prev) => {
      if (!prev.includes(packageName)) {
        return [...prev, packageName];
      }
      return prev;
    });
  };

  const unloadPackage = (packageName) => {
    if (packageName === 'Nyan Cat') return;
    setLoadedPackages((prev) => prev.filter((p) => p !== packageName));
  };

  const deletePackage = (packageName) => {
    if (packageName === 'Nyan Cat') return;

    // 1. Unload package
    setLoadedPackages((prev) => prev.filter((p) => p !== packageName));

    // 2. Identify keys to delete
    const keysToDelete = Object.keys(customParts).filter(
      (key) => customParts[key].package === packageName
    );

    // 3. Delete from customParts
    setCustomParts((prev) => {
      const copy = { ...prev };
      keysToDelete.forEach((key) => {
        delete copy[key];
      });
      return copy;
    });

    // 4. Clean up bindings
    setBindings((prev) => {
      const nextBindings = { ...prev };
      Object.keys(nextBindings).forEach((slot) => {
        if (keysToDelete.includes(nextBindings[slot])) {
          nextBindings[slot] = 'default';
        }
      });
      return nextBindings;
    });

    // 5. Clean up layers
    setLayers((prev) => prev.filter((layer) => !keysToDelete.includes(layer.partName)));
  };

  // Import default sprite into editor helper
  const getDefaultSpriteData = (spriteKey) => {
    const raw = defaultSprites[spriteKey];
    if (!raw) return { width: 11, height: 11, data: Array(11).fill().map(() => Array(11).fill(0)) };
    const matrix = getSpriteMatrix(raw);
    const height = matrix.length;
    const width = matrix[0].length;
    return { width, height, data: JSON.parse(JSON.stringify(matrix)) };
  };

  // Add a layer to the Assembler
  const addLayer = (partName) => {
    if (activeProfileId === 'system_default') return null;
    const newId = 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    // Find highest z-index
    const maxZ = layers.length > 0 ? Math.max(...layers.map(l => l.zIndex)) : 0;

    setLayers((prev) => [
      ...prev,
      {
        id: newId,
        partName,
        x: 400, // centered default positioning
        y: 200,
        zIndex: maxZ + 1,
        visible: true
      }
    ]);
    return newId;
  };

  // Update a single layer's property (x, y, zIndex, visible)
  const updateLayer = (id, updates) => {
    if (activeProfileId === 'system_default') return;
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  };

  // Delete a layer
  const deleteLayer = (id) => {
    if (activeProfileId === 'system_default') return;
    setLayers((prev) => prev.filter((layer) => layer.id !== id));
  };

  // Duplicate a layer
  const duplicateLayer = (id) => {
    if (activeProfileId === 'system_default') return;
    const target = layers.find((l) => l.id === id);
    if (!target) return;
    const newId = 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setLayers((prev) => [
      ...prev,
      {
        ...target,
        id: newId,
        zIndex: Math.max(...prev.map(l => l.zIndex)) + 1,
        x: target.x + 15, // shift slightly
        y: target.y + 15
      }
    ]);
  };

  // Move layer order (up / down in z-index)
  const reorderLayer = (id, direction) => {
    if (activeProfileId === 'system_default') return;
    // direction: 'up' (higher z-index) or 'down' (lower z-index)
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const index = sorted.findIndex((l) => l.id === id);
    if (index === -1) return;

    if (direction === 'up' && index < sorted.length - 1) {
      // Swap zIndex with the next one
      const temp = sorted[index].zIndex;
      sorted[index].zIndex = sorted[index + 1].zIndex;
      sorted[index + 1].zIndex = temp;
    } else if (direction === 'down' && index > 0) {
      // Swap zIndex with the previous one
      const temp = sorted[index].zIndex;
      sorted[index].zIndex = sorted[index - 1].zIndex;
      sorted[index - 1].zIndex = temp;
    }
    setLayers(sorted);
  };

  // --- PROFILE ACTIONS ---

  const createProfile = (name, width, height) => {
    const id = 'profile_' + Date.now();
    const newProfile = {
      id,
      name: name.trim() || 'New Profile',
      resolution: { width: parseInt(width) || 1920, height: parseInt(height) || 462 },
      background: { type: 'transparent', value: '' },
      layers: [] // Starts completely empty!
    };

    setProfiles((prev) => {
      const next = { ...prev, [id]: newProfile };
      localStorage.setItem('nyan_studio_assembler_profiles', JSON.stringify(next));
      return next;
    });

    setActiveProfileId(id);
    setLayers([]);
    setBackground({ type: 'transparent', value: '' });
    setResolution(newProfile.resolution);
    localStorage.setItem('nyan_studio_active_profile_id', id);
    return id;
  };

  const loadProfile = (id) => {
    if (id === 'system_default') {
      if (systemProfileData) {
        setActiveProfileId('system_default');
        setLayers(systemProfileData.layers || []);
        setBackground(systemProfileData.background || { type: 'starfield', value: '' });
        setResolution(systemProfileData.resolution || { width: 1920, height: 462 });
        localStorage.setItem('nyan_studio_active_profile_id', 'system_default');
      }
      return;
    }
    const profile = profiles[id];
    if (profile) {
      setActiveProfileId(id);
      setLayers(profile.layers || []);
      setBackground(profile.background || { type: 'transparent', value: '' });
      setResolution(profile.resolution || { width: 1920, height: 462 });
      localStorage.setItem('nyan_studio_active_profile_id', id);
    }
  };

  const saveProfile = () => {
    if (!activeProfileId || activeProfileId === 'system_default') return;
    setProfiles((prev) => {
      const next = {
        ...prev,
        [activeProfileId]: {
          ...prev[activeProfileId],
          layers,
          background,
          resolution
        }
      };
      localStorage.setItem('nyan_studio_assembler_profiles', JSON.stringify(next));
      return next;
    });
    setToastMessage(t('toasts.profileSaved'));
    setTimeout(() => setToastMessage(''), 3000);
  };

  const deleteProfile = (id) => {
    if (id === 'system_default') return;
    setProfiles((prev) => {
      const next = { ...prev };
      delete next[id];
      localStorage.setItem('nyan_studio_assembler_profiles', JSON.stringify(next));
      return next;
    });
    if (activeProfileId === id) {
      setActiveProfileId(null);
      setLayers([]);
      setBackground({ type: 'transparent', value: '' });
      setResolution({ width: 1920, height: 462 });
      localStorage.removeItem('nyan_studio_active_profile_id');
    }
  };

  const cloneProfile = (id, newName) => {
    let sourceLayers = [];
    let sourceBg = { type: 'transparent', value: '' };
    let sourceRes = { width: 1920, height: 462 };

    if (id === 'system_default') {
      if (systemProfileData) {
        sourceLayers = JSON.parse(JSON.stringify(systemProfileData.layers || []));
        sourceBg = JSON.parse(JSON.stringify(systemProfileData.background || { type: 'starfield', value: '' }));
        sourceRes = JSON.parse(JSON.stringify(systemProfileData.resolution || { width: 1920, height: 462 }));
      }
    } else {
      const source = profiles[id];
      if (source) {
        sourceLayers = JSON.parse(JSON.stringify(source.layers || []));
        sourceBg = JSON.parse(JSON.stringify(source.background || { type: 'transparent', value: '' }));
        sourceRes = JSON.parse(JSON.stringify(source.resolution || { width: 1920, height: 462 }));
      }
    }

    const newId = 'profile_' + Date.now();
    const cloned = {
      id: newId,
      name: newName.trim() || 'Cloned Profile',
      resolution: sourceRes,
      background: sourceBg,
      layers: sourceLayers
    };

    setProfiles((prev) => {
      const next = { ...prev, [newId]: cloned };
      localStorage.setItem('nyan_studio_assembler_profiles', JSON.stringify(next));
      return next;
    });

    setActiveProfileId(newId);
    setLayers(sourceLayers);
    setBackground(sourceBg);
    setResolution(sourceRes);
    localStorage.setItem('nyan_studio_active_profile_id', newId);
    return newId;
  };

  const importIndividualProfile = (payload) => {
    try {
      if (payload.type !== 'nyan_studio_profile' || !payload.profile) {
        return { success: false, error: 'Sai định dạng profile JSON' };
      }

      const importedProfile = payload.profile;
      const importedCustomParts = payload.customParts || {};

      // 1. Merge custom parts (migrate legacy format)
      let mergedPartsCount = 0;
      setCustomParts((prev) => {
        const next = { ...prev };
        Object.keys(importedCustomParts).forEach((k) => {
          if (!next[k]) {
            const part = importedCustomParts[k];
            const matrix = part.matrix || part.data;
            const colors = part.colors || part.palette || null;
            next[k] = {
              ...part,
              matrix,
              colors,
              package: part.package || 'My Custom'
            };
            delete next[k].data;
            delete next[k].palette;
            mergedPartsCount++;
          }
        });
        return next;
      });

      // 2. Add profile
      const newId = 'profile_' + Date.now();
      const newProfile = {
        ...importedProfile,
        id: newId,
        name: importedProfile.name.endsWith('(Imported)') ? importedProfile.name : `${importedProfile.name} (Imported)`
      };

      setProfiles((prev) => {
        const next = { ...prev, [newId]: newProfile };
        localStorage.setItem('nyan_studio_assembler_profiles', JSON.stringify(next));
        return next;
      });

      setToastMessage(t('toasts.profileImported', { name: newProfile.name }));
      setTimeout(() => setToastMessage(''), 3000);
      return { success: true, id: newId, mergedPartsCount };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.message };
    }
  };

  const closeActiveProfile = () => {
    setActiveProfileId(null);
    setLayers([]);
    setBackground({ type: 'transparent', value: '' });
    setResolution({ width: 1920, height: 462 });
    localStorage.removeItem('nyan_studio_active_profile_id');
  };

  const checkHasUnsavedChanges = () => {
    if (!activeProfileId || !profiles[activeProfileId]) return false;
    const saved = profiles[activeProfileId];

    const layersChanged = JSON.stringify(saved.layers) !== JSON.stringify(layers);
    const backgroundChanged = JSON.stringify(saved.background) !== JSON.stringify(background);
    const resolutionChanged = JSON.stringify(saved.resolution) !== JSON.stringify(resolution);

    return layersChanged || backgroundChanged || resolutionChanged;
  };

  // Bind a custom part to Nyan dynamic slot
  const bindPartToSlot = (slot, partName) => {
    setBindings((prev) => ({ ...prev, [slot]: partName }));
  };

  // Reset entire project to default vanilla state
  const resetEntireProject = () => {
    if (window.confirm(t('dialogs.resetConfirm'))) {
      fetch('/defaultProject.json')
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            if (data.customParts) {
              const upgraded = {};
              Object.keys(data.customParts).forEach((k) => {
                const part = data.customParts[k];
                const matrix = part.matrix || part.data;
                const colors = part.colors || part.palette || null;
                upgraded[k] = {
                  ...part,
                  matrix,
                  colors,
                  package: part.package || 'My Custom'
                };
                delete upgraded[k].data;
                delete upgraded[k].palette;
              });
              setCustomParts(upgraded);
            }
            if (data.layers) setLayers(data.layers);
            if (data.background) setBackground(data.background);
            if (data.bindings) setBindings(data.bindings);
            if (data.settings) setSettings({ ...INITIAL_SETTINGS, ...data.settings });
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            alert(t('dialogs.resetSuccess'));
          }
        })
        .catch((err) => {
          console.error('Failed to reset to default model:', err);
          // Fallback to blank state
          setCustomParts({});
          setLayers([]);
          setBackground({ type: 'transparent', value: '' });
          setBindings({
            HEAD_OPEN: 'default',
            POPTART: 'default',
            TAIL_UP: 'default',
            TAIL_MID: 'default',
            TAIL_DOWN: 'default',
            LEG_DOWN: 'default',
            LEG_FRONT: 'default',
            LEG_BACK: 'default'
          });
          setSettings(INITIAL_SETTINGS);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          alert(t('dialogs.resetFailEmpty'));
        });
    }
  };

  // Export all custom model data as an English-keyed JSON string
  const exportProjectJson = () => {
    const data = {
      generator: 'Nyan Cat Pixel Art Studio',
      timestamp: new Date().toISOString(),
      customParts,
      layers,
      background,
      bindings,
      settings
    };
    return JSON.stringify(data, null, 2);
  };

  // Import model data from a JSON string
  const importProjectJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.customParts) {
        const upgraded = {};
        Object.keys(parsed.customParts).forEach((k) => {
          const part = parsed.customParts[k];
          const matrix = part.matrix || part.data;
          const colors = part.colors || part.palette || null;
          upgraded[k] = {
            ...part,
            matrix,
            colors,
            package: part.package || 'My Custom'
          };
          delete upgraded[k].data;
          delete upgraded[k].palette;
        });
        setCustomParts(upgraded);
      }
      if (parsed.layers) setLayers(parsed.layers);
      if (parsed.background) setBackground(parsed.background);
      if (parsed.bindings) setBindings(parsed.bindings);
      if (parsed.settings) setSettings({ ...INITIAL_SETTINGS, ...parsed.settings });
      return { success: true };
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return { success: false, error: e.message };
    }
  };

  // Helper: Retrieve actual dynamic rendering matrices by evaluating bindings
  const getActiveRenderPartsMapping = () => {
    const mapping = {};
    const live = liveEditingPartRef.current;

    // Helper to find matching custom part in library
    const findLibraryMatch = (slot) => {
      const slotLower = slot.toLowerCase();
      const keys = Object.keys(customParts);

      if (slotLower.startsWith('head')) {
        const openKey = keys.find(k => k.includes('head') && k.includes('open'));
        const genericKey = keys.find(k => k.includes('head'));

        return openKey || genericKey;
      }

      if (slotLower.startsWith('poptart')) {
        return keys.find(k => k.includes('poptart') || k.includes('cookie') || k.includes('body'));
      }

      if (slotLower.startsWith('tail')) {
        const upKey = keys.find(k => k.includes('tail') && k.includes('up'));
        const midKey = keys.find(k => k.includes('tail') && k.includes('mid'));
        const downKey = keys.find(k => k.includes('tail') && k.includes('down'));
        const genericKey = keys.find(k => k.includes('tail'));

        if (slotLower === 'tail_up') return upKey || midKey || downKey || genericKey;
        if (slotLower === 'tail_mid') return midKey || upKey || downKey || genericKey;
        if (slotLower === 'tail_down') return downKey || midKey || upKey || genericKey;
      }

      if (slotLower.startsWith('leg')) {
        const downKey = keys.find(k => k.includes('leg') && k.includes('down'));
        const frontKey = keys.find(k => k.includes('leg') && k.includes('front'));
        const backKey = keys.find(k => k.includes('leg') && k.includes('back'));
        const genericKey = keys.find(k => k.includes('leg'));

        if (slotLower === 'leg_down') return downKey || frontKey || backKey || genericKey;
        if (slotLower === 'leg_front') return frontKey || downKey || backKey || genericKey;
        if (slotLower === 'leg_back') return backKey || downKey || frontKey || genericKey;
      }

      return null;
    };

    Object.keys(bindings).forEach((slot) => {
      const partKey = bindings[slot];

      // 1. Prioritize explicit custom bindings
      if (partKey && partKey !== 'default') {
        if (live && live.key === partKey && live.data) {
          mapping[slot] = live.data;
        } else if (customParts[partKey]) {
          // Use .matrix (new format) with fallback to .data (legacy)
          mapping[slot] = customParts[partKey].matrix || customParts[partKey].data;
        } else {
          mapping[slot] = getSpriteMatrix(defaultSprites[slot]);
        }
      }
      // 2. Intelligent real-time paint projection
      else if (live && live.key && live.data) {
        const keyLower = live.key.toLowerCase();
        const slotLower = slot.toLowerCase();

        let matches = false;
        if (slotLower.startsWith('head') && keyLower.includes('head')) {
          if (slotLower === 'head_open') {
            matches = keyLower.includes('open') || keyLower.includes('head');
          } else {
            matches = true;
          }
        } else if (slotLower.startsWith('poptart') && (keyLower.includes('poptart') || keyLower.includes('cookie') || keyLower.includes('body'))) {
          matches = true;
        } else if (slotLower.startsWith('tail') && keyLower.includes('tail')) {
          if (slotLower === 'tail_up') {
            matches = keyLower.includes('up') || (keyLower.includes('mid') && bindings.TAIL_UP === 'default') || (keyLower.includes('down') && bindings.TAIL_UP === 'default');
          } else if (slotLower === 'tail_mid') {
            matches = keyLower.includes('mid') || (keyLower.includes('up') && bindings.TAIL_MID === 'default') || (keyLower.includes('down') && bindings.TAIL_MID === 'default');
          } else if (slotLower === 'tail_down') {
            matches = keyLower.includes('down') || (keyLower.includes('up') && bindings.TAIL_DOWN === 'default') || (keyLower.includes('mid') && bindings.TAIL_DOWN === 'default');
          } else {
            matches = true;
          }
        } else if (slotLower.startsWith('leg') && keyLower.includes('leg')) {
          if (slotLower === 'leg_down') {
            matches = keyLower.includes('down') || (keyLower.includes('front') && bindings.LEG_DOWN === 'default') || (keyLower.includes('back') && bindings.LEG_DOWN === 'default');
          } else if (slotLower === 'leg_front') {
            matches = keyLower.includes('front') || (keyLower.includes('down') && bindings.LEG_FRONT === 'default') || (keyLower.includes('back') && bindings.LEG_FRONT === 'default');
          } else if (slotLower === 'leg_back') {
            matches = keyLower.includes('back') || (keyLower.includes('down') && bindings.LEG_BACK === 'default') || (keyLower.includes('front') && bindings.LEG_BACK === 'default');
          } else {
            matches = true;
          }
        }

        if (matches) {
          mapping[slot] = live.data;
        } else {
          // If we are drawing something else, check if library has a matching custom part for this slot
          const libMatchKey = findLibraryMatch(slot);
          if (libMatchKey && customParts[libMatchKey]) {
            mapping[slot] = customParts[libMatchKey].matrix || customParts[libMatchKey].data;
          } else {
            mapping[slot] = getSpriteMatrix(defaultSprites[slot]);
          }
        }
      }
      // 3. Smart library auto-match fallback
      else {
        const libMatchKey = findLibraryMatch(slot);
        if (libMatchKey && customParts[libMatchKey]) {
          mapping[slot] = customParts[libMatchKey].matrix || customParts[libMatchKey].data;
        } else {
          mapping[slot] = getSpriteMatrix(defaultSprites[slot]);
        }
      }
    });
    return mapping;
  };

  const allProfiles = {
    ...(systemProfileData ? { system_default: systemProfileData } : {}),
    ...profiles
  };

  return (
    <AppContext.Provider
      value={{
        customParts,
        layers,
        setLayers,
        background,
        bindings,
        settings,
        toastMessage,
        setToastMessage,
        liveEditingPartRef,
        updateSetting,
        t,
        saveCustomPart,
        deleteCustomPart,
        getDefaultSpriteData,
        addLayer,
        updateLayer,
        deleteLayer,
        duplicateLayer,
        reorderLayer,
        bindPartToSlot,
        setBackground,
        resetEntireProject,
        exportProjectJson,
        importProjectJson,
        getActiveRenderPartsMapping,
        profiles: allProfiles,
        activeProfileId,
        resolution,
        setResolution,
        createProfile,
        loadProfile,
        saveProfile,
        deleteProfile,
        cloneProfile,
        importIndividualProfile,
        closeActiveProfile,
        checkHasUnsavedChanges,
        loadedPackages,
        loadPackage,
        unloadPackage,
        deletePackage,
        customPalettes,
        importCustomPalette,
        deleteCustomPalette,
        defaultSprites
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

import os
import subprocess
import shutil
import sys

def convert_webm_to_mp4():
    print("=======================================================")
    print("    NYAN CAT MP4 CONVERSION HELPER (PYTHON FALLBACK)    ")
    print("=======================================================")
    print()

    # 1. Search for nyan_cat_1920x462.webm
    downloads_path = os.path.expanduser("~/Downloads")
    search_locations = [
        os.path.join(downloads_path, "nyan_cat_1920x462.webm"),
        "nyan_cat_1920x462.webm"
    ]

    source_file = None
    for loc in search_locations:
        if os.path.exists(loc):
            source_file = loc
            break

    if not source_file:
        print("[WARNING] Could not locate 'nyan_cat_1920x462.webm' in Downloads or local folder.")
        print("Please record your WebM from index.html in the browser first!")
        sys.exit(1)

    print(f"[FOUND] WebM source file located at: {source_file}")

    # 2. Check for FFmpeg installation
    ffmpeg_installed = shutil.which("ffmpeg") is not None
    if not ffmpeg_installed:
        print("[ERROR] FFmpeg utility not found on your system path.")
        print()
        print("To install FFmpeg:")
        print("  1. Windows: Run `winget install Gyan.FFmpeg` in PowerShell")
        print("  2. Manual: Download from https://ffmpeg.org/download.html")
        print()
        sys.exit(1)

    output_file = "nyan_cat_1920x462_loop.mp4"
    print(f"[INFO] Compiling {output_file} (24 FPS, 5Mbps Bitrate, H.264)...")
    print()

    # 3. Subprocess run ffmpeg command
    cmd = [
        "ffmpeg", "-y",
        "-i", source_file,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-b:v", "5M",
        "-r", "24",
        output_file
    ]

    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if result.returncode == 0:
            print("=======================================================")
            print("[SUCCESS] Conversion completed perfectly!")
            print(f"Output File: {os.path.abspath(output_file)}")
            print("=======================================================")
        else:
            print("[ERROR] FFmpeg encountered an error during compiling:")
            print(result.stderr.decode("utf-8"))
    except Exception as e:
        print(f"[ERROR] Subprocess execution failed: {e}")

if __name__ == "__main__":
    convert_webm_to_mp4()

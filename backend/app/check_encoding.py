import os
import sys

def check_files(root_dir):
    print(f"Scanning {root_dir} for encoding issues...")
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith((".py", ".env", ".example")):
                path = os.path.join(root, file)
                try:
                    with open(path, "rb") as f:
                        content = f.read()
                    content.decode("utf-8")
                except UnicodeDecodeError as e:
                    print(f"ENCODING ERROR: {path}")
                    print(f"  Reason: {e}")
                    # Try to fix it by reading as "latin-1" and writing as "utf-8"
                    try:
                        with open(path, "r", encoding="latin-1") as f:
                            text = f.read()
                        with open(path, "w", encoding="utf-8") as f:
                            f.write(text)
                        print(f"  FIXED: Converted to UTF-8")
                    except Exception as fe:
                        print(f"  FAILED to fix: {fe}")

if __name__ == "__main__":
    check_files(os.getcwd())

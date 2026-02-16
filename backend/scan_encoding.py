import os

print("Scanning for non-UTF-8 files...")
for root, dirs, files in os.walk("app"):
    for file in files:
        if file.endswith(".py"):
            path = os.path.join(root, file)
            try:
                with open(path, "rb") as f:
                    content = f.read()
                    try:
                        content.decode("utf-8")
                    except UnicodeDecodeError as e:
                        print(f"File {path} FAIL: {e}")
            except Exception as e:
                print(f"Error reading {path}: {e}")
print("Scan complete.")

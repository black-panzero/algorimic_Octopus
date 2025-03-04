import sys
import os

def diagnose_import():
    print("Python Executable:", sys.executable)
    print("Python Version:", sys.version)
    print("\nPython Path:")
    for path in sys.path:
        print(path)
    
    print("\nInstalled Packages:")
    try:
        import pkg_resources
        installed_packages = [d for d in pkg_resources.working_set]
        for package in installed_packages:
            if 'langchain' in package.key or 'anthropic' in package.key:
                print(f"{package.key} - {package.version}")
    except ImportError:
        print("Could not use pkg_resources to list packages")
    
    print("\nTrying to import langchain_anthropic:")
    try:
        import langchain_anthropic
        print("Import successful!")
        print("Module path:", langchain_anthropic.__file__)
    except ImportError as e:
        print("Import failed:", e)
    
    print("\nEnvironment Variables:")
    print("PYTHONPATH:", os.environ.get('PYTHONPATH', 'Not set'))

if __name__ == '__main__':
    diagnose_import()
"""
Health check script for the Air Quality Monitoring System
Verifies that all dependencies are installed and configured correctly
"""
import sys
import os


def check_python_version():
    """Check Python version is 3.9+"""
    print("✓ Checking Python version...", end=" ")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 9:
        print(f"✅ Python {version.major}.{version.minor}")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor} (need 3.9+)")
        return False


def check_backend_dependencies():
    """Check required Python packages"""
    print("✓ Checking backend dependencies...")
    required = {
        'fastapi': 'FastAPI',
        'pandas': 'Pandas',
        'numpy': 'NumPy',
        'uvicorn': 'Uvicorn'
    }
    
    all_ok = True
    for package, name in required.items():
        try:
            __import__(package)
            print(f"  ✅ {name}")
        except ImportError:
            print(f"  ❌ {name} - not installed")
            all_ok = False
    
    return all_ok


def check_data_file():
    """Check if CSV data file exists"""
    print("✓ Checking data file...", end=" ")
    if os.path.exists('../data/dataset.csv'):
        print("✅ dataset.csv found")
        return True
    else:
        print("❌ dataset.csv not found")
        return False


def check_backend_structure():
    """Check backend directory structure"""
    print("✓ Checking backend structure...")
    dirs = ['fuzzy', 'services', 'utils', 'tests']
    all_ok = True
    for dir_name in dirs:
        if os.path.isdir(dir_name):
            print(f"  ✅ {dir_name}/")
        else:
            print(f"  ❌ {dir_name}/ missing")
            all_ok = False
    return all_ok


def check_main_module():
    """Check if main.py exists"""
    print("✓ Checking main module...", end=" ")
    if os.path.exists('main.py'):
        print("✅ main.py found")
        return True
    else:
        print("❌ main.py not found")
        return False


def main():
    """Run all health checks"""
    print("=" * 50)
    print("🏥 Health Check - Air Quality Monitoring System")
    print("=" * 50)
    print()
    
    checks = [
        ("Python Version", check_python_version),
        ("Data File", check_data_file),
        ("Backend Structure", check_backend_structure),
        ("Main Module", check_main_module),
        ("Backend Dependencies", check_backend_dependencies),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Error checking {name}: {e}")
            results.append((name, False))
        print()
    
    # Summary
    print("=" * 50)
    passed = sum(1 for _, r in results if r)
    total = len(results)
    print(f"Results: {passed}/{total} checks passed")
    
    if passed == total:
        print("✅ All checks passed! Ready to run.")
        print()
        print("Start the backend with: python main.py")
        return 0
    else:
        print("❌ Some checks failed. See above for details.")
        return 1


if __name__ == "__main__":
    sys.exit(main())

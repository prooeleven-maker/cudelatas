// Test compilation file
#include <windows.h>
#include <winhttp.h>
#include <wincrypt.h>
#include <iostream>
#include <string>

#pragma comment(lib, "winhttp.lib")
#pragma comment(lib, "crypt32.lib")

int main() {
    std::cout << "Test compilation successful!" << std::endl;
    return 0;
}
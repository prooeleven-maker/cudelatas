#include <windows.h>
#include <winhttp.h>
#include <wincrypt.h>
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

// Link with required libraries
#pragma comment(lib, "winhttp.lib")
#pragma comment(lib, "crypt32.lib")

/**
 * Simple JSON parser for basic response handling
 * In production, consider using a proper JSON library like nlohmann/json
 */
class SimpleJsonParser {
public:
    static std::string getStringValue(const std::string& json, const std::string& key) {
        std::string searchKey = "\"" + key + "\":";
        size_t pos = json.find(searchKey);
        if (pos == std::string::npos) return "";

        pos += searchKey.length();
        // Skip whitespace
        while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t')) pos++;

        if (json[pos] == '"') {
            // String value
            pos++; // Skip opening quote
            size_t endPos = json.find('"', pos);
            if (endPos != std::string::npos) {
                return json.substr(pos, endPos - pos);
            }
        }
        return "";
    }

    static bool getBoolValue(const std::string& json, const std::string& key) {
        std::string searchKey = "\"" + key + "\":";
        size_t pos = json.find(searchKey);
        if (pos == std::string::npos) return false;

        pos += searchKey.length();
        // Skip whitespace
        while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t')) pos++;

        if (json.substr(pos, 4) == "true") return true;
        if (json.substr(pos, 5) == "false") return false;
        return false;
    }
};

/**
 * SHA-256 hashing utility
 */
class SHA256Hasher {
public:
    static std::string hash(const std::string& input) {
        HCRYPTPROV hProv = 0;
        HCRYPTHASH hHash = 0;
        DWORD cbHash = 0;
        BYTE rgbHash[32];
        CHAR rgbDigits[] = "0123456789abcdef";

        if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
            throw std::runtime_error("CryptAcquireContext failed");
        }

        if (!CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash)) {
            CryptReleaseContext(hProv, 0);
            throw std::runtime_error("CryptCreateHash failed");
        }

        if (!CryptHashData(hHash, (BYTE*)input.c_str(), input.length(), 0)) {
            CryptDestroyHash(hHash);
            CryptReleaseContext(hProv, 0);
            throw std::runtime_error("CryptHashData failed");
        }

        cbHash = 32;
        if (!CryptGetHashParam(hHash, HP_HASHVAL, rgbHash, &cbHash, 0)) {
            CryptDestroyHash(hHash);
            CryptReleaseContext(hProv, 0);
            throw std::runtime_error("CryptGetHashParam failed");
        }

        CryptDestroyHash(hHash);
        CryptReleaseContext(hProv, 0);

        std::string result;
        for (DWORD i = 0; i < cbHash; i++) {
            result += rgbDigits[rgbHash[i] >> 4];
            result += rgbDigits[rgbHash[i] & 0xf];
        }

        return result;
    }
};

/**
 * HTTP client for license validation
 */
class HttpClient {
private:
    HINTERNET hSession;
    HINTERNET hConnect;
    HINTERNET hRequest;

public:
    HttpClient() : hSession(NULL), hConnect(NULL), hRequest(NULL) {}

    ~HttpClient() {
        cleanup();
    }

    bool initialize(const std::string& domain, int port = 443) {
        hSession = WinHttpOpen(L"LicenseValidator/1.0",
                              WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
                              WINHTTP_NO_PROXY_NAME,
                              WINHTTP_NO_PROXY_BYPASS,
                              0);

        if (!hSession) return false;

        std::wstring wDomain(domain.begin(), domain.end());
        hConnect = WinHttpConnect(hSession, wDomain.c_str(), port, 0);

        return hConnect != NULL;
    }

    std::string postRequest(const std::string& path, const std::string& postData) {
        if (!hConnect) return "";

        std::wstring wPath(path.begin(), path.end());
        hRequest = WinHttpOpenRequest(hConnect,
                                     L"POST",
                                     wPath.c_str(),
                                     NULL,
                                     WINHTTP_NO_REFERER,
                                     WINHTTP_DEFAULT_ACCEPT_TYPES,
                                     WINHTTP_FLAG_SECURE);

        if (!hRequest) return "";

        // Set headers
        std::wstring headers = L"Content-Type: application/json\r\n";
        if (!WinHttpAddRequestHeaders(hRequest, headers.c_str(), headers.length(), WINHTTP_ADDREQ_FLAG_ADD)) {
            return "";
        }

        // Send request
        DWORD dataLen = postData.length();
        if (!WinHttpSendRequest(hRequest,
                               WINHTTP_NO_ADDITIONAL_HEADERS,
                               0,
                               (LPVOID)postData.c_str(),
                               dataLen,
                               dataLen,
                               0)) {
            return "";
        }

        // Receive response
        if (!WinHttpReceiveResponse(hRequest, NULL)) {
            return "";
        }

        // Read response data
        std::string response;
        DWORD dwSize = 0;
        DWORD dwDownloaded = 0;
        LPSTR pszOutBuffer;

        do {
            dwSize = 0;
            if (!WinHttpQueryDataAvailable(hRequest, &dwSize)) {
                break;
            }

            if (dwSize == 0) break;

            pszOutBuffer = new char[dwSize + 1];
            if (!pszOutBuffer) break;

            ZeroMemory(pszOutBuffer, dwSize + 1);

            if (!WinHttpReadData(hRequest, (LPVOID)pszOutBuffer, dwSize, &dwDownloaded)) {
                delete[] pszOutBuffer;
                break;
            }

            response.append(pszOutBuffer, dwDownloaded);
            delete[] pszOutBuffer;

        } while (dwSize > 0);

        return response;
    }

private:
    void cleanup() {
        if (hRequest) WinHttpCloseHandle(hRequest);
        if (hConnect) WinHttpCloseHandle(hConnect);
        if (hSession) WinHttpCloseHandle(hSession);
        hRequest = hConnect = hSession = NULL;
    }
};

/**
 * License validator class
 */
class LicenseValidator {
private:
    std::string apiDomain;
    std::string apiPath;

public:
    LicenseValidator(const std::string& domain = "cudelate.vercel.app")
        : apiDomain(domain), apiPath("/api/verify-key") {}

    /**
     * Validate a license key
     * @param licenseKey The license key to validate (format: FORTE-XXXX-XXXX-XXXX)
     * @return true if valid, false otherwise
     */
    bool validateLicenseKey(const std::string& licenseKey) {
        try {
            // Hash the license key before sending to API
            std::string keyHash = SHA256Hasher::hash(licenseKey);

            // Create HTTP client
            HttpClient client;
            if (!client.initialize(apiDomain)) {
                std::cout << "Failed to initialize HTTP client" << std::endl;
                return false;
            }

            // Create JSON payload with the hashed key
            std::stringstream jsonPayload;
            jsonPayload << "{\"key\":\"" << keyHash << "\"}";

            // Send request
            std::string response = client.postRequest(apiPath, jsonPayload.str());

            if (response.empty()) {
                std::cout << "Failed to receive response from server" << std::endl;
                return false;
            }

            // Parse response
            bool isValid = SimpleJsonParser::getBoolValue(response, "valid");

            if (isValid) {
                std::cout << "License key is valid!" << std::endl;
                std::string expiresAt = SimpleJsonParser::getStringValue(response, "expires_at");
                if (!expiresAt.empty()) {
                    std::cout << "Expires at: " << expiresAt << std::endl;
                }
                return true;
            } else {
                std::string error = SimpleJsonParser::getStringValue(response, "error");
                std::cout << "License validation failed: " << error << std::endl;
                return false;
            }

        } catch (const std::exception& e) {
            std::cout << "Error validating license: " << e.what() << std::endl;
            return false;
        }
    }
};

/**
 * Main application entry point
 */
int main() {
    std::cout << "=====================================" << std::endl;
    std::cout << "         LICENSE VALIDATOR" << std::endl;
    std::cout << "=====================================" << std::endl;
    std::cout << std::endl;

    // Initialize license validator
    LicenseValidator validator("cudelate.vercel.app");

    // Get license key from user
    std::string licenseKey;
    std::cout << "Enter your license key:" << std::endl;
    std::cout << "Format: FORTE-XXXX-XXXX-XXXX" << std::endl;
    std::cout << "> ";
    std::getline(std::cin, licenseKey);

    // Validate license
    if (validator.validateLicenseKey(licenseKey)) {
        std::cout << std::endl;
        std::cout << "License validation successful!" << std::endl;
        std::cout << "Starting application..." << std::endl;

        // Your application logic goes here
        // For demo purposes, just wait
        std::cout << std::endl;
        std::cout << "Press Enter to exit...";
        std::cin.ignore();
        return 0;

    } else {
        std::cout << std::endl;
        std::cout << "License validation failed!" << std::endl;
        std::cout << "Application will now exit." << std::endl;
        std::cout << std::endl;
        std::cout << "Press Enter to exit...";
        std::cin.ignore();
        return 1;
    }
}
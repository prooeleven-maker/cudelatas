# C++ License Validator Example

This example demonstrates how to integrate license key validation into a C++ Windows application.

## Features

- SHA-256 hashing of license keys
- HTTPS POST requests to validation API
- Simple JSON response parsing
- User-friendly console interface
- Error handling and validation

## Prerequisites

- Windows 10/11
- Visual Studio 2019/2022 with C++ support
- Windows SDK (included with Visual Studio)

## Compilation

### Using Visual Studio

1. Create a new **Windows Console Application** project
2. Replace the contents of the main .cpp file with the code from `license_validator.cpp`
3. Make sure the following libraries are linked:
   - `winhttp.lib`
   - `crypt32.lib`
4. Build the project in **Release** configuration

### Using Command Line

```batch
cl /EHsc /MT /O2 license_validator.cpp /link winhttp.lib crypt32.lib /out:license_validator.exe
```

## Configuration

Before compiling, update the API domain in the code:

```cpp
// Replace with your actual Vercel domain
LicenseValidator validator("your-api-domain.vercel.app");
```

## Usage

1. Run the compiled executable
2. Enter your license key when prompted (format: XXXX-XXXX-XXXX-XXXX)
3. The application will validate the key with your API
4. If valid, the application continues; if invalid, it exits

## Security Notes

- This example sends license keys in plain text over HTTPS
- In production, consider additional security measures:
  - Hardware ID binding
  - Obfuscation
  - Anti-debugging techniques
  - Encrypted communication

## Dependencies

This example uses only Windows API functions:

- **WinHTTP**: For HTTPS requests
- **CryptoAPI**: For SHA-256 hashing
- **Standard Library**: For string manipulation and I/O

No external libraries are required.

## Error Handling

The example includes basic error handling for:

- Network failures
- Invalid responses
- JSON parsing errors
- Cryptographic failures

## Production Considerations

For production use, consider:

1. **Proper JSON Library**: Replace the simple parser with nlohmann/json
2. **HTTP Client**: Consider using libcurl for more features
3. **Retry Logic**: Implement exponential backoff for network failures
4. **Offline Validation**: Cache validation results for offline use
5. **Rate Limiting**: Respect API rate limits
6. **Logging**: Add proper logging instead of console output

## API Response Format

The API returns JSON responses:

**Valid Key:**
```json
{
  "valid": true,
  "expires_at": "2024-12-31T23:59:59Z",
  "message": "License key is valid"
}
```

**Invalid Key:**
```json
{
  "valid": false,
  "error": "License key not found"
}
```
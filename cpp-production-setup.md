# C++ Application - Production Setup

## Configuração para Produção

### Quando Deployar no Vercel:

1. **Altere o domínio no `entryPoint.cpp`:**

```cpp
// ANTES (desenvolvimento):
LicenseValidator g_LicenseValidator("localhost", true);

// DEPOIS (produção):
LicenseValidator g_LicenseValidator("seu-dominio.vercel.app", false);
```

2. **Recompile o aplicativo C++** com as novas configurações

### Como Obter uma Chave de Licença Válida:

1. **Acesse o painel admin:** `https://seu-dominio.vercel.app/admin`
2. **Faça login** com suas credenciais do Supabase
3. **Clique** "Generate New Key"
4. **Copie a chave** que aparece (só aparece uma vez!)
5. **Use essa chave** no aplicativo C++

### Fluxo Completo:

```
Usuário executa Forte.exe
    ↓
Console aparece pedindo chave
    ↓
Usuário digita chave (XXXX-XXXX-XXXX-XXXX)
    ↓
App faz POST para /api/verify-key
    ↓
Servidor valida chave no Supabase
    ↓
Se válida: app continua
Se inválida: app fecha
```

### Testando Localmente:

1. **Servidor:** `npm run dev` (porta 3000)
2. **C++ App:** Compilado com configuração localhost
3. **Teste:** Use chave gerada no painel admin

### Para Produção:

1. **Deploy Next.js:** `vercel`
2. **Atualize domínio** no código C++
3. **Recompile C++ app**
4. **Distribua** o executável atualizado

## Segurança:

- ✅ Chaves são hasheadas com SHA-256
- ✅ Comunicação HTTPS em produção
- ✅ Rate limiting na API
- ✅ Validação de formato de chave
- ✅ Logs de uso das chaves

## Troubleshooting:

### App não conecta ao servidor:
- Verifique se o domínio está correto
- Certifique-se de que o servidor está rodando
- Teste a API diretamente: `curl -X POST https://seudominio.vercel.app/api/verify-key -d '{"key":"CHAVE-TESTE"}'`

### Chave rejeitada:
- Verifique se a chave existe no banco
- Confirme se está ativa
- Cheque se não expirou

### Console não aparece:
- Execute como administrador
- Verifique permissões do Windows
# FORTE - Sistema de Autenticação e Licenciamento

## Visão Geral

Sistema completo de autenticação com:
- ✅ Login/Registro com Username e Senha
- ✅ Verificação de License Key
- ✅ Proteção HWID (Hardware ID)
- ✅ Validação de expiração
- ✅ Logs detalhados no servidor
- ✅ Execução com privilégios de administrador

## Estrutura do Banco de Dados

### Tabela: `license_keys`

```sql
- id                 (UUID, PK)
- key_hash           (TEXT, UNIQUE) - SHA256 da license key
- username           (TEXT, UNIQUE) - Nome de usuário
- password_hash      (TEXT) - SHA256 da senha
- hwid               (TEXT) - Hardware ID do computador
- is_active          (BOOLEAN) - Chave ativa/inativa
- is_registered      (BOOLEAN) - Chave já registrada
- created_at         (TIMESTAMP)
- expires_at         (TIMESTAMP) - Data de expiração
- last_used_at       (TIMESTAMP) - Último acesso
- created_by         (UUID, FK) - Admin que criou
```

## Configuração Inicial

### 1. Aplicar Migração no Supabase

Execute o arquivo `sql/migration.sql` no SQL Editor do Supabase:

```sql
ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS hwid TEXT;
ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS is_registered BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_license_keys_username ON license_keys(username);
CREATE INDEX IF NOT EXISTS idx_license_keys_hwid ON license_keys(hwid);
```

### 2. Criar License Key

No painel admin, crie uma license key. O sistema irá:
- Gerar hash SHA256 automaticamente
- Definir `is_registered = false`
- Definir `is_active = true`
- Configurar data de expiração (opcional)

## Fluxo de Uso

### Primeira Vez (Registro)

1. Usuário abre o FORTE.exe (solicita admin automaticamente)
2. Clica na aba **REGISTER**
3. Preenche:
   - **License Key**: A key fornecida pelo admin
   - **Username**: Nome de usuário desejado (3-32 caracteres)
   - **Password**: Senha (mínimo 6 caracteres)
4. Clica em **REGISTER**

**O que acontece:**
- Sistema coleta HWID do computador
- Envia key_hash + username + password_hash + HWID para API
- API valida a key e registra o usuário
- Key é marcada como `is_registered = true`
- HWID é vinculado à conta

### Logins Subsequentes

1. Usuário abre o FORTE.exe
2. Usa a aba **LOGIN**
3. Preenche:
   - **Username**
   - **Password**
4. Clica em **LOGIN**

**O que acontece:**
- Sistema valida username + password
- Verifica se HWID corresponde ao registrado
- Se tudo OK, inicia o FORTE

## Proteções Implementadas

### 1. Proteção HWID
- Cada conta só pode ser usada no computador onde foi registrada
- Tentativa de login em outro PC resulta em erro: "HWID mismatch"

### 2. Validações de Senha
- Mínimo 6 caracteres
- Hash SHA256 antes de enviar
- Nunca armazenada em texto plano

### 3. Validação de License Key
- Deve estar ativa (`is_active = true`)
- Não pode estar expirada
- Só pode ser registrada uma vez

### 4. Execução como Admin
- O arquivo `app.manifest` força execução com privilégios elevados
- Necessário para algumas funcionalidades do cheat

## Mensagens de Erro

### Login

| Mensagem | Significado |
|----------|-------------|
| "Invalid username or password" | Credenciais incorretas |
| "HWID mismatch" | Tentativa de login em outro PC |
| "Your license has expired" | License expirou |
| "Account is inactive" | Conta desativada pelo admin |

### Registro

| Mensagem | Significado |
|----------|-------------|
| "Invalid license key" | Key não existe ou hash incorreto |
| "License key already registered" | Key já foi usada para criar conta |
| "Username already taken" | Username já em uso |
| "License key has expired" | Key expirou antes do registro |
| "License key is inactive" | Key desativada pelo admin |

## APIs Disponíveis

### POST `/api/register`

**Request:**
```json
{
  "key": "sha256_hash_da_license_key",
  "username": "usuario123",
  "password": "sha256_hash_da_senha",
  "hwid": "sha256_hash_do_hwid"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "expires_at": "2025-12-31T23:59:59.000Z",
  "message": "Account registered successfully!"
}
```

**Response (Erro):**
```json
{
  "success": false,
  "error": "License key already registered to another account"
}
```

### POST `/api/login`

**Request:**
```json
{
  "username": "usuario123",
  "password": "sha256_hash_da_senha",
  "hwid": "sha256_hash_do_hwid"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "expires_at": "2025-12-31T23:59:59.000Z",
  "message": "Login successful!"
}
```

**Response (Erro):**
```json
{
  "success": false,
  "error": "HWID mismatch. This account is registered to another computer."
}
```

## Logs do Servidor

Todos os eventos são logados com detalhes:

```
[REGISTER INFO] Registration attempt for username: usuario123
[REGISTER INFO] Successfully registered user: usuario123

[LOGIN INFO] Login attempt for username: usuario123
[LOGIN INFO] HWID mismatch for username: usuario123 - Expected: a1b2c3d4... Got: x9y8z7w6...
[LOGIN INFO] Successful login for username: usuario123
```

## Compilação (Visual Studio)

1. Abra `Forte.sln`
2. O manifesto `app.manifest` será automaticamente incluído
3. Compile em Release mode
4. O executável final solicitará admin automaticamente

## Segurança

✅ Senhas hasheadas com SHA256
✅ License keys hasheadas com SHA256
✅ HWID único por máquina
✅ Comunicação HTTPS
✅ Validação server-side
✅ Rate limiting nas APIs
✅ Logs detalhados para auditoria
✅ Execução com privilégios elevados

## Manutenção

### Desativar uma conta
```sql
UPDATE license_keys SET is_active = false WHERE username = 'usuario';
```

### Resetar HWID (permitir mudança de PC)
```sql
UPDATE license_keys SET hwid = NULL WHERE username = 'usuario';
```

### Ver logins recentes
```sql
SELECT username, last_used_at FROM license_keys 
WHERE last_used_at > NOW() - INTERVAL '7 days'
ORDER BY last_used_at DESC;
```

### Estatísticas
```sql
-- Total de contas registradas
SELECT COUNT(*) FROM license_keys WHERE is_registered = true;

-- Keys ainda não usadas
SELECT COUNT(*) FROM license_keys WHERE is_registered = false;

-- Contas ativas
SELECT COUNT(*) FROM license_keys WHERE is_active = true AND is_registered = true;
```

## Suporte

Para problemas, verifique:
1. Logs do servidor (console do Next.js)
2. Status da key no Supabase
3. Mensagem de erro exibida no cliente
4. Console do navegador (Vercel deployment logs)

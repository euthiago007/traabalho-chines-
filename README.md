# Velvet Dreams — CRUD e autenticação

## Executar no Windows

Use Node.js 22.18 ou superior (Node.js 24 recomendado). Extraia o ZIP, abra a pasta que contém `package.json` no VS Code e execute:

```powershell
npm install
npm run dev:all
```

Abra http://localhost:3000. Não é necessário instalar ou criar um banco de dados. O JSON Server já é instalado pelo npm e usa `db.json` como arquivo de dados.

Login de demonstração (já cadastrado):

- E-mail: `thiago07@gmail.com`
- Senha: `TemaOSangueAntigo99`

Há apenas um usuário inicial. Novos usuários cadastrados podem entrar com suas próprias credenciais. O token dura uma hora. Use “Sair” para remover a sessão deste navegador.

O ZIP inclui `.env.local` para executar imediatamente. Esse arquivo é ignorado pelo Git. Ao clonar em outro computador, copie `.env.example` para `.env.local` e substitua `AUTH_SECRET` por um segredo aleatório com pelo menos 32 caracteres. Para gerar:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

O segredo não deve ser publicado no GitHub. `API_URL` é uma variável exclusiva do servidor; o endereço padrão é `http://127.0.0.1:3001`.

## Verificar

```powershell
npm run build
npm run test:auth
```

Para conferir manualmente: em uma janela anônima, tente abrir `/usuarios`, `/dashboard` e `/produtos`. Todas devem voltar ao login. Teste uma senha incorreta, entre com a senha correta, cadastre/edite/exclua um usuário, saia e tente acessar novamente uma página interna.

## Escopo

Projeto didático com JSON Server local. As senhas de demonstração permanecem em texto puro no arquivo, conforme a estrutura recebida. A API interna do JSON Server não implementa autenticação e deve permanecer restrita ao computador local; nunca exponha a porta 3001 publicamente. O navegador usa exclusivamente `/api/dados`, que exige um token assinado e válido.

O CRUD de usuários inclui máscaras de CPF, telefone, CEP e nascimento, validações, pesquisa e consulta opcional ao ViaCEP. O cadastro de produtos foi preservado como no ZIP original, sem opção de editar produtos. A autenticação complementa o CRUD de usuários.

Veja `ALTERACOES-E-VIDEO.md` para a explicação do código e o roteiro da apresentação.

## Experiência de uso

Login com spinner e feedback mínimo de 600 ms, mostrar/ocultar senha, bloqueio dos campos durante envio, mensagens para sessão expirada e indicadores acessíveis de carregamento, salvamento e exclusão. Animações respeitam a preferência de movimento reduzido.

O único usuário inicial é Thiago Duarte. Endereço inspirado em Yharnam com CEP de Cafezal do Sul/PR; endereço e telefone servem apenas para demonstração. CPF e nascimento são dados de exemplo, não dados pessoais confirmados. O ViaCEP pode substituir a cidade ao consultar novamente o CEP; depois da consulta é possível editar o endereço fictício.
# traabalho-chines-

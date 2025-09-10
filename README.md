# Capital Gains

Neste repositório, está a implementação de um programa em linha de comando (CLI) que calcula o imposto a ser pago sobre lucros ou prejuízos de operações no mercado financeiro de ações.

O projeto utiliza [Bun](https://bun.com) como TypeScript runtime. Não há nenhuma biblioteca em uso além dos tipos e as dependências principais do próprio TypeScript e Bun.

O Bun foi escolhido como runtime pela velocidade quando comparado ao runtime padrão de Node ou a outras alternativas como o Deno. Além disso, algumas APIs do próprio Bun, como o seu próprio test runner que é muito similar ao Jest, garante que seja possível executar os testes nativamente sem a necessidade de bibliotecas externas.

A respeito da arquitetura escolhida, prezei por manter simples, com o mínimo possível para que o projeto cumpra com os requisitos e ao mesmo tempo pensando na manutenibilidade e legibilidade de código. A pasta onde contém todo o código fonte contém a seguinte estrutura:

```
├── src
│   ├── __tests__
│   │   ├── index.spec.ts
│   │   ├── portfolio.spec.ts
│   │   └── utils.spec.ts
│   ├── index.ts
│   ├── portfolio.ts
│   ├── types.ts
│   └── utils.ts
```

Os testes foram adicionados na pasta `__tests__` e com o sufixo `*.spec.ts` para manter a compatibilidade e o padrão utilizado no Jest, o qual o Bun test runner é inspirado. Além disso, temos 4 arquivos: `index.ts`, `portfolio.ts`, `types.ts` e `utils.ts`.

O `index.ts`, seguindo a nomenclatura base de projetos TypeScript, é o ponto de entrada do programa, contendo somente a "interface" CLI com a lógica necessária para executar o programa: ler a entrada do usuário pelo `stdin`, executar o código de cálculo de taxa e imprimir a saída em JSON no `stdout`.

Em `types.ts`, ainda seguindo o padrão TypeScript, é onde contém a definição dos tipos usados pelo projeto. Como apenas haviam 2 tipos a serem definidos e pensando na simplicidade, decidi manter em um único arquivo ao invés de criar uma pasta `types` e dois arquivos distintos.

O arquivo `utils.ts` contém apenas um utilitário (`roundNumber`) que desenvolvi para o requisito que o programa deve arredondar os valores para a segunda casa decimal. Embora fosse possível usar funções nativas como o `.toFixed`, optei por não usar pois a função `toFixed` retorna uma string ao invés de um número, e ao transformar o resultado em JSON para a saída padrão quebraria o contrato (que o número deve ser do tipo numérico) além de não ser a abordagem correta.

Por fim, o arquivo `portfolio.ts` contém uma classe `Portfolio` na qual lida com todas as operações do programa. Optei por usar uma classe ao invés de funções pois entre entradas de um mesmo caso de teste, é necessário manter o estado de alguns valores como o preço médio ponderado, e usar o básico de orientação a objeto aqui ajuda bastante, além de o código ficar quase que auto-explicativo.

Como a entrada do usuário é em JSON e a saída também, e TypeScript é por via de regra um superset do JavaScript, a implementação se tornou bastante simplificada por não ser necessárias conversões de tipos, bastando apenas realizar alguns poucos _casts_ ou renomear variáveis apenas para manter o padrão da linguagem (como usar `_` ao invés de `-` em identificadores).

## Executando localmente

### Opção 1: Docker build

O projeto conta com um Dockerfile que instala e configura o projeto para ser executado sem a necessidade de possuir o Bun runtime instalado.

Para isso, basta você ter o Docker instalado e disponível no seu terminal.

Primeiro, execute o seguinte comando para realizar o _build_ da imagem:

```bash
docker build -t capital-gains .
```

Depois, para executar o container, use o seguinte comando:

```bash
docker run -i capital-gains
```

### Opção 2: Bun runtime

Primeiro, você precisa ter o Bun instalado. Utilize o seu gerenciador de pacotes favorito (ou o disponível no seu sistema operacional) ou o seguinte comando:

Em um ambiente *nix (Linux, macOS):
```bash
curl -fsSL https://bun.sh/install | bash
```

Depois, instale as dependências do projeto, usando:

```bash
bun install
```

Para executar o projeto, use:

```bash
bun run start
```

## Executando os testes

O projeto conta com testes unitários e de integração. Para executá-los, basta rodar o seguinte comando, seja no console do container Docker ou diretamente no terminal caso você tenha o instalado localmente usando Bun:

```bash
bun test
```

Se você tiver um caso de teste (como um arquivo txt), você pode executá-lo diretamente usando o seguinte comando:

```bash
bun run start < input.txt
```

---

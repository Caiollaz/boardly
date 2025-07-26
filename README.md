# Boardly - Quadro Branco Online

Um quadro branco online simplificado para criar ideias, colaborar e compartilhar. Perfeito para brainstorming, diagramas, wireframing e muito mais, com uma tela infinita para dar vida aos seus pensamentos.

## ✨ Funcionalidades

- **🖊️ Ferramentas de Desenho**: Caneta, retângulos, círculos, setas e linhas
- **📝 Editor de Texto**: Adicione texto com diferentes tamanhos e cores
- **🎯 Seleção e Movimento**: Selecione e mova elementos facilmente
- **🧹 Borracha**: Remova elementos indesejados
- **🔴 Ponteiro Laser**: Destaque pontos importantes durante apresentações
- **📊 Diagramas**: Crie diagramas a partir de texto usando Mermaid
- **🖱️ Navegação**: Pan e zoom para navegar pela tela infinita
- **↩️ Histórico**: Desfazer e refazer ações
- **💾 Salvamento Local**: Todos os dados são salvos localmente no navegador
- **📤 Exportação**: Compartilhe seu quadro como imagem PNG

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- Navegador moderno com suporte a Canvas API

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Caiollaz/boardly.git
   cd boardly
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o projeto:**
   ```bash
   npm run dev
   ```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000).

## 🛠️ Como Usar

### Ferramentas Disponíveis

- **🖐️ Mão (Pan)**: Navegue pela tela arrastando
- **👆 Seleção**: Clique para selecionar e mover elementos
- **🖊️ Caneta**: Desenhe livremente na tela
- **⬜ Retângulo**: Desenhe retângulos
- **⭕ Círculo**: Desenhe círculos
- **➡️ Seta**: Crie setas conectadas
- **📏 Linha**: Desenhe linhas simples
- **📝 Texto**: Adicione texto editável
- **🧹 Borracha**: Remova elementos
- **📊 Diagrama**: Crie diagramas com Mermaid
- **🔴 Laser**: Use ponteiro laser para apresentações

### Atalhos e Dicas

- **Duplo clique** em texto para editar
- **Clique e arraste** para mover elementos
- **Botão direito** para opções de contexto
- Use o **histórico** (desfazer/refazer) para corrigir erros
- **Exporte** seu quadro para compartilhar

## 🏗️ Desenvolvimento

### Estrutura do Projeto

```
boardly/
├── App.tsx              # Componente principal
├── components/          # Componentes React
│   ├── Toolbar.tsx     # Barra de ferramentas
│   ├── MermaidModal.tsx # Modal para diagramas
│   └── icons/          # Ícones SVG
├── types.ts            # Definições TypeScript
└── package.json        # Dependências
```

### Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Constrói para produção
npm run preview  # Visualiza build de produção
```

### Tecnologias Utilizadas

- **React 19** - Framework de interface
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Canvas API** - Renderização gráfica
- **Mermaid** - Geração de diagramas

## 🚀 Deploy

Para fazer deploy em produção:

```bash
npm run build
npm start
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- 🐛 Reportar bugs
- 💡 Sugerir novas funcionalidades
- 🔧 Enviar pull requests
- 📝 Melhorar a documentação

## 📄 Licença

Este projeto está licenciado sob a MIT License.

---

**Boardly** - Transforme suas ideias em realidade com o poder de um quadro branco digital infinito.


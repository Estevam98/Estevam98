# Commit Cave — PNG assets

Esta pasta recebe as camadas PNG e a spritesheet opcional do explorador. O jogo continua funcionando sem esses arquivos: quando um PNG não existe, falha ao carregar ou tem dimensões diferentes das especificadas, o Canvas usa o desenho procedural já existente para aquele elemento.

## Arquivos de cenário

| Arquivo | Dimensão obrigatória | Conteúdo esperado |
|---|---:|---|
| `layer-far.png` | **480 × 270 px** | Fundo distante: lua, céu, montanhas e castelo gótico |
| `layer-mid.png` | **480 × 270 px** | Camada intermediária: paredes, arcadas, rochas e detalhes de fundo |
| `layer-front.png` | **480 × 270 px** | Primeiro plano: plataformas, bordas de rocha, musgo e elementos próximos |

As três imagens devem ser PNG RGBA, com transparência onde a camada precisa revelar as que estão atrás. Todas usam o mesmo enquadramento 16:9 de 480 × 270 pixels. O Canvas desenha cada imagem no tamanho lógico de 480 × 270 e aplica parallax horizontal nas camadas distante e intermediária.

A água, espuma, cristais luminosos, morcegos, tochas, fogueira, brasas, fumaça, HUD e dados do GitHub continuam sendo renderizados pelo JavaScript por cima das camadas.

## Spritesheet Universal LPC do explorador

Arquivo: `hero-sheet.png`

A spritesheet enviada ao repositório foi verificada como **1152 × 4224 px**, organizada em **18 colunas × 66 linhas**, com quadros de **64 × 64 px**. O carregador aceita outras folhas estendidas desde que largura e altura sejam múltiplos de 64 e exista ao menos um quadro.

| Estado | Linha LPC (índice iniciado em 0) | Quadros | FPS |
|---|---:|---:|---:|
| `idle` — respiração/parado | 25 | 4 | 4 |
| `walk` — Walk Right | 11 | 9 | 9 |
| `run` — Walk Right acelerado | 11 | 9 | 14 |
| `celebrate` — Spellcast Right | 3 | 7 | 8 |
| `drink` — Thrust Right | 7 | 8 | 6 |
| `sleep` — Hurt/caído | 20 | 6 | 3 |

A linha 25 é usada para `idle` quando existe e contém pixels visíveis. Se a folha não tiver essa linha ou ela estiver totalmente transparente, o explorador usa o primeiro quadro da linha 11 como fallback de repouso. Se uma linha de animação estiver ausente ou totalmente transparente, a lógica tenta a linha 11 com um único quadro; se ela também não estiver disponível, usa o sprite procedural.

O recorte usa `sourceX = frame × 64` e `sourceY = row × 64`. Antes de desenhar, o código verifica os limites reais de largura e altura e inspeciona se as linhas usadas contêm pixels não transparentes. Cada quadro é desenhado no Canvas a 64 × 64 pixels lógicos, com `imageSmoothingEnabled = false`; o personagem é espelhado horizontalmente quando `hero.dir === -1`.

## Fallback e validação

O carregamento é independente para cada imagem:

- Se uma camada estiver pronta, ela substitui somente a camada procedural correspondente.
- Se uma camada estiver ausente ou inválida, o Canvas mantém `far`, `mid`, `front` ou `heroPixel()` para aquela parte.
- A lógica de commits, GitHub Actions, fome, água, evolução, morcegos, fogo, tochas, partículas e animação continua independente dos arquivos gráficos.

Para ativar a arte PNG, adicione os quatro arquivos com os nomes e dimensões acima nesta pasta. Não é necessário alterar o HTML nem o workflow de publicação.

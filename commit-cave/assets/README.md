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

## Spritesheet do explorador

Arquivo: `hero-sheet.png`

- **Dimensão total obrigatória:** 192 × 288 px.
- **Quadro individual:** 48 × 48 px.
- **Grade:** 4 colunas × 6 linhas.
- Formato: PNG RGBA com fundo transparente.
- Cada linha contém quatro quadros consecutivos da mesma animação.
- Os pés do personagem devem ficar alinhados na base do quadro para manter o contato com as plataformas.

| Linha (começa em 0) | Estado | FPS padrão |
|---:|---|---:|
| 0 | `idle` — respiração/descanso | 4 |
| 1 | `walk` — caminhada | 9 |
| 2 | `run` — corrida | 13 |
| 3 | `celebrate` — comemoração | 8 |
| 4 | `drink` — beber água | 6 |
| 5 | `sleep` — dormir | 3 |

A origem de cada quadro é calculada pela coluna (`frame × 48`) e pela linha (`row × 48`). A direção horizontal é invertida pelo Canvas quando o explorador caminha para a esquerda.

## Fallback e validação

O carregamento é independente para cada imagem:

- Se uma camada estiver pronta, ela substitui somente a camada procedural correspondente.
- Se uma camada estiver ausente ou inválida, o Canvas mantém `far`, `mid`, `front` ou `heroPixel()` para aquela parte.
- A lógica de commits, GitHub Actions, fome, água, evolução, morcegos, fogo, tochas, partículas e animação continua independente dos arquivos gráficos.

Para ativar a arte PNG, adicione os quatro arquivos com os nomes e dimensões acima nesta pasta. Não é necessário alterar o HTML nem o workflow de publicação.

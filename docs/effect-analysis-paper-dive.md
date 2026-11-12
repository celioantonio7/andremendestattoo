# Análise das referências (12/11/2026)

## Paper × domgl

Referência: https://github.com/twotwentytwo-studio/codrops-paper

Foram examinados README, FeaturedCard.vue e SeamBand.vue. O projeto sincroniza planos WebGPU com elementos do DOM, usa refração/lente nas imagens, legenda que troca de posição no hover e faixas de passagem com ruído que seguem o ponteiro. Não é um efeito de papel desenrolando.

Combina com este site nas bordas dos cards, no vidro dos botões e em uma passagem curta entre capítulos. Não convém deformar as tatuagens ou o rosto: a qualidade do trabalho precisa continuar legível. A implementação atual reutiliza a fumaça WebGL em superfícies 2D leves, com máscara nas bordas e proteção do centro; não é o motor WebGPU desse demo.

O README declara domgl e @domgl/motion proprietários, sem autorização de reutilização incluída. Os ports de Paper Shaders têm licença Apache 2.0, separadamente. Nenhum código ou asset desse repositório foi incorporado.

## Dive-in

Referência: https://github.com/Animmaster/Dive-in-effect/blob/main/script.js

O script usa pin, abertura progressiva de máscaras, zoom em camadas e texto final em perspectiva. Combina com a transição do portfólio para “Arte que fica”. A seção existente já adapta essa sequência com fotos reais e alternativa para movimento reduzido. O zoom 2.9× do original não foi copiado, para evitar perda de qualidade nas tatuagens. Recomenda-se manter uma única sequência de mergulho, sem repetir o mesmo zoom entre todas as seções.

# Assets André Mendes

Preparados com a ferramenta integrada image_gen e exportados em WebP em `public/art/`.

- `andre-cutout.webp`: pixels RGB de `public/andremendes.png`, com máscara alpha extraída pela ferramenta. Rosto e óculos mantidos da fotografia original; apenas transparência, corte de margens e compressão de exportação.
- `andre-lettering.webp`, `mendes-lettering.webp`: lettering recriado a partir da referência da hero.
- `lion.webp`, `dragon.webp`, `mandala.webp`, `sculpture.webp`, `hannya.webp`, `machine.webp`: seis artes conceituais recriadas, não registros de tatuagens realizadas.
- `am-logo.webp`: recorte do AM na referência original da hero.

## Prompts finais (image_gen integrado)

1. **background-extraction:** remover somente o fundo azul da fotografia original, fundo transparente, preservar rosto, óculos âmbar, cabelo, pose, textura e iluminação. Não adicionar texto nem gráficos. Usar apenas a máscara resultante sobre os pixels da foto original.
2. **stylized-concept:** folha 3 × 2, células iguais sem margens: leão de gravura prateada; dragão japonês com hibiscos vermelhos; mandala blackwork; escultura clássica com rosa; Hannya com flores; máquina de tatuagem. Fundo preto, texturas de gravura das referências, luz vermelha/âmbar, sem azul/ciano, sem textos, sem retratos e sem UI.
3. **background-extraction / logo-brand:** lettering em duas linhas transparentes, ANDRÉ prateado acima e MENDES vermelho abaixo, preservar estilo de pincel metálico angular e acento É da referência, sem retrato ou outros elementos.

O script `scripts/prepare-art.mjs` documenta os recortes e a exportação usados nesta sessão; as versões finais necessárias ao site já estão salvas em `public/art/`.

Atualização: o AM foi extraído com transparência usando image_gen, sem o recorte retangular preto. Prompt: remover somente o fundo preto do logo AM existente, preservar strokes, geometria, branco/prata e swoosh vermelho; sem contorno retangular, sombra ou brilho novo. Versão final em `public/art/am-logo.webp`; favicon correspondente em `public/favicon-am.png` e `public/favicon.ico`; ícone Apple em `public/apple-touch-icon.png`.

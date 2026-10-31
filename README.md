# Simulador de poder amostral · EBE

Ferramenta independente para explorar o planejamento de comparações pareadas. O primeiro caso usa os resumos publicados de Attarieh et al. (2026), sobre extensão e abdução de quadril. A leitura crítica do artigo permanece na Biblioteca EBE; o simulador tem repositório, código e publicação próprios.

- Ferramenta: https://gwfreccia.github.io/ebe-simulador-amostral/
- Leitura do artigo: https://gwfreccia.github.io/EBE/artigos/attarieh-2026/

## Usar e desenvolver

`index.html` é a entrada pronta. Estilos, fontes, dados e scripts estão embutidos, permitindo abrir esse arquivo diretamente ou publicar por GitHub Pages. Referências externas precisam de internet.

```sh
npm test
python3 build.py
python3 -m http.server 8767 --bind 127.0.0.1
```

Abra http://127.0.0.1:8767/. O build usa a biblioteca padrão do Python; os testes usam o runner nativo do Node. Não é necessário instalar pacotes npm. O template em `src/page.template` é material de desenvolvimento; gere `index.html` antes de conferir alterações visuais.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `src/stats.js` | Núcleo numérico do teste t pareado bilateral; sem interface ou dependência do artigo |
| `src/planning.js` | Alvos, escalas de efeito e cálculo de cenários por desfecho |
| `src/cases/attarieh-2026.json` | Médias, DP e contrastes publicados; proveniência do primeiro caso |
| `src/app.js` | Controles, tabelas, gráficos, frequências e explicações contextuais |
| `src/style.css` | Identidade EBE: azul, Maven Pro e Newsreader; layout responsivo |
| `src/page.template` | Estrutura da interface, sem ser uma entrada navegável |
| `build.py` | Gera o HTML portátil a partir dos arquivos deste repositório |
| `tests/` | Referências independentes e testes do núcleo e do planejamento |

Os dados do caso são separados do núcleo para permitir a evolução da ferramenta sem acoplá-la ao HTML do artigo. Esta versão oferece um caso; não implementa modelos para grupos independentes, ANCOVA, interações regionais ou outros desenhos.

## Ciência e premissas

As médias e os DP basais são da Tabela Suplementar 1. A diferença bruta entre mudanças é calculada das médias arredondadas; não deve ser confundida com a diferença ajustada da ANCOVA. O GMax geral é a média de três áreas de cortes e não representa volume integral.

O DP das diferenças pareadas não foi recuperado dos testes F/t da ANCOVA. Ele é uma hipótese ajustável. O mesmo DP é aplicado aos cinco cenários para fins de comparação didática, sem afirmar que as regiões tenham a mesma variabilidade real.

Três opções de alvo: valor em cm², fração do DP basal ou magnitude da diferença bruta publicada como hipótese para uma nova coleta. Uma fração de 0,20 do DP basal é uma convenção exploratória, não um limiar estético. Reutilizar o resultado de uma amostra pequena pode produzir um planejamento otimista; não demonstra o poder retrospectivo do estudo.

O núcleo usa a distribuição t não central, com `d_z=Δ/DP_pareado`, não centralidade `d_z√n` e `n−1` graus de liberdade. Considera as duas caudas, diferenças normais e pessoas independentes entre si. Busca n inteiro entre 5 e 10.000. `≤5` indica que a meta já foi atingida no início desse intervalo; `>10.000` indica limite de busca, sem estimar um n além dele.

As opções de Bonferroni são exemplos de famílias previamente definidas; não reconstituem as três ANCOVAs do artigo. Recrutamento usa `ceil(n_completo/(1−perda))`, uma expectativa que não garante completude nem resolve viés por perdas.

A decomposição opcional do DP assume mudanças verdadeiras com igual variância, correlação ρ e erros independentes nos quatro exames: `sqrt(2*DP_mudança²*(1−ρ)+4*SEM²)`. Ela substitui o DP total, evitando somar erro duas vezes. Não estima o erro de RM do estudo.

O exercício de 1.000 estudos usa uma proporção hipotética de hipóteses verdadeiras. Não atribui probabilidade de falsidade ao resultado de Attarieh.

## Validação

Os testes Node usam referências calculadas com SciPy, de forma independente da integração numérica JavaScript. Os valores necessários para os testes estão versionados; SciPy não é dependência de uso ou de execução normal dos testes. A geração das referências está em `tests/generate_reference.py` e requer SciPy apenas para regenerá-las.

A referência cobre poder, n mínimo no intervalo declarado, perdas e dados do caso. A interface foi conferida com controles reais, tooltips por clique/teclado, diferentes larguras, entrada local e endereço publicado. Evidências transitórias de navegador ficam fora do repositório.

## Fontes

- Attarieh et al. (2026), DOI 10.1519/JSC.0000000000005701, PMID 42842490. Tabela Suplementar 1; Resultados, pp. 4–5.
- Lakens (2013), DOI 10.3389/fpsyg.2013.00863, PMID 24324449. Denominadores de efeitos padronizados.
- Lakens (2022), DOI 10.1525/collabra.33267. Justificativa amostral, sensibilidade e poder retrospectivo.

O conhecimento canônico continua no Vault EBE. Esta ferramenta é um produto didático derivado, sem acesso aos dados individuais do estudo.

## Fontes tipográficas e marca

Maven Pro e Newsreader têm licenças OFL incluídas em `assets/`. A marca EBE é usada na identidade da ferramenta. Consulte `LICENCAS.md`; este repositório não concede uma nova licença de redistribuição da marca ou do restante do conteúdo.

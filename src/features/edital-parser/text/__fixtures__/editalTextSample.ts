// Excerto de edital PÚBLICO usado como fixture do parser de texto.
//
// Fonte: edital do Pregão Eletrônico nº 90.070/2026 (PNCP 552/2026), publicado
// pelo poder público e disponível no Portal Nacional de Contratações Públicas.
// O arquivo original fica em pasta example/ (gitignored); este excerto contém
// apenas o cabeçalho, as cláusulas de prazos e a tabela de itens — nenhum dado
// pessoal (CPF, RG, bancário) ou proposta de empresa, conforme docs/HANDOFF.md.
//
// Regiões: [0, 8000) do documento (introdução, sessão, prazos) + [84900, 102400)
// (Termo de Referência, tabela de 35 itens e cláusulas de prazos do TR). As
// regiões intermediárias não são usadas pelo parser e foram omitidas.
export const EDITAL_TEXT_SAMPLE: string = `Estado do Rio de Janeiro
MUNICÍPIO DE ANGRA DOS REIS
Secretaria de Gestão de Suprimentos
Processo nº SEI-2025-06001343
EDITAL DE PREGÃO ELETRÔNICO 
SECRETARIA DE DESENVOLVIMENTO SOCIAL E PROMOÇÃO DA CIDADANIA
PREGÃO ELETRÔNICO PARA REGISTRO DE PREÇOS Nº 90.070/2026
NÚMERO DO EDITAL NO PNCP 552/2026
NÚMERO DA UASG NO PNCP 985801
1. INTRODUÇÃO
1.1  –  O  Município  de  Angra  dos  Reis,  por  meio  da SECRETARIA  DE  DESENVOLVIMENTO  SOCIAL  E
PROMOÇÃO  DA  CIDADANIA,  torna  público  que  fará  realizar  licitação,  sob  a  modalidade  de  pregão
eletrônico, pelo critério de julgamento MENOR PREÇO POR ITEM sendo Registro de Preços AQUISIÇÃO DE
MATERIAIS DE CAMA, MESA E BANHO para atender as necessidades das Secretarias e Autarquias do
Município  de  Angra  dos  Reis , pertencente(s)  à(s)  classe(s)  bens comuns,  devidamente  descritos,
caracterizados e especificados neste edital e/ou no termo de referência, na forma da lei.
1.2 – A presente licitação se rege por toda a legislação aplicável à espécie, especialmente pelas normas de
caráter geral da Lei Federal nº 14.133/2021, da Lei Complementar Federal nº 123/2006 (Estatuto Nacional
da Microempresa e da Empresa de Pequeno Porte), da  Lei Complementar Federal  nº 101/2000  (Lei de
Responsabilidade Fiscal), do Código de Defesa do Consumidor, instituído pela Lei Federal nº 8.078/90 e suas
alterações, bem como pelos preceitos de Direito Público, pelas disposições deste Edital e de seus Anexos,
normas que as licitantes declaram conhecer e a elas se sujeitarem incondicional e irrestritamente.
1.3 – A presente licitação será processada exclusivamente por meio eletrônico, sendo utilizado o Sistema
COMPRAS.GOV,  disponibilizado  e  processado  no  endereço  eletrônico  https://www.gov.br/compras/pt-br
(Portal Nacional de Compras), mantido pelo Governo Federal, e regulamentado pelo Decreto Federal nº
10.024/2019, a que as licitantes interessadas se submetem, devendo providenciar o seu credenciamento
junto ao referido sistema, no sítio antes indicado, para obtenção da chave de identificação e da senha, antes
da data determinada para a realização do Pregão Eletrônico. 
1.4 – As retificações do Edital obrigarão todas as licitantes e serão divulgadas pelos mesmos meios de
divulgação do Edital.
1.5 – A licitação que é objeto do presente Edital poderá ser adiada ou revogada por razões de interesse
público, sem que caiba às licitantes qualquer direito a reclamação ou indenização por estes motivos, de
acordo com o art.71, inciso II e §2º, da Lei Federal nº 14.133/2021.
1.6 – As licitantes interessadas poderão obter o presente Edital e seus anexos no endereço eletrônico
https://www.gov.br/compras/pt-br.
1.7 – Os pedidos de esclarecimentos referentes ao processo licitatório serão enviados ao pregoeiro, até 3
(três) dias úteis anteriores à data fixada para abertura da sessão pública, por meio eletrônico, endereçado
ao correio eletrônico pregao@angra.rj.gov.br.
1.7.1 – O pregoeiro responderá aos pedidos de esclarecimentos no prazo de 3 (três) dias úteis, contado da
data de recebimento do pedido, limitado ao último dia útil anterior à data da abertura do certame, e poderá
requisitar subsídios formais aos responsáveis pela elaboração do edital e dos anexos. As respostas aos
pedidos de esclarecimentos serão divulgadas pelo sistema e vincularão os participantes e a Administração.
1.8 – Os interessados poderão formular impugnações até 3 (três) dias úteis anteriores à data fixada para
abertura da sessão pública por meio eletrônico, endereçado ao correio eletrônico: pregao@angra.rj.gov.br.Estado do Rio de Janeiro
MUNICÍPIO DE ANGRA DOS REIS
Secretaria de Gestão de Suprimentos
Processo nº SEI-2025-06001343
1.8.1 – Caberá ao pregoeiro, auxiliado pelos responsáveis pela elaboração do edital e dos anexos, decidir
sobre a impugnação no prazo de 3 (três) dias úteis, contado da data de recebimento da impugnação.
1.8.2 – A impugnação possui efeito suspensivo até que sobrevenha decisão final da autoridade competente.
1.8.3 – Acolhida a impugnação contra o edital, será definida e publicada nova data para realização do
certame.
1.9  –  A  licitação  não  prosseguirá  nos  atos  ulteriores  até  que  sejam  prestados  os  esclarecimentos  ou
respondidas as impugnações existentes. Oferecida a resposta da Administração, a sessão de recebimento
das propostas será realizada nos prazos indicados nos itens 1.7.1. ou 1.8.1., conforme o caso, no mesmo
horário e local, salvo quando houver designação expressa de outra data pelo Pregoeiro a ser divulgada pelos
mesmos meios de divulgação do Edital.
2. DIA, HORÁRIO E LOCAL DA ABERTURA DA LICITAÇÃO
2.1  – No  dia 16  de outubro  de 2026, às  10:00  hs,  o  Pregoeiro  iniciará  a sessão  pública  do  PREGÃO
ELETRÔNICO  PARA  REGISTRO  DE  PREÇOS  Nº  90.070/2026,  no  endereço  eletrônico
https://www.gov.br/compras/pt-br (Portal Nacional de Compras Públicas).
2.2 – No caso de a licitação não poder ser realizada na data estabelecida, será adiada para o primeiro dia
útil posterior, no mesmo horário e local, salvo designação expressa de outra data pelo Pregoeiro a ser
divulgada pelos mesmos meios de divulgação do Edital.
3. OBJETO
3.1 – O objeto da presente licitação é o Registro de Preços para Aquisição de Materiais de Cama, Mesa e
Banho  para  atender  as  necessidades  das  Secretarias  e  Autarquias  do  Município  de  Angra  dos  Reis,
pertencente(s) à(s) classe(s) bens comuns, conforme as especificações constantes deste Edital e/ou do
Termo de Referência.
3.1.1 – Em caso de discordância existente entre as especificações do objeto descritas no CATMAT e as
constantes deste Edital, prevalecerão as do Termo de Referência.
4. RECURSOS ORÇAMENTÁRIOS
4.1 – Os recursos necessários à aquisição do objeto ora licitado correrão à conta da seguinte dotação
orçamentária:
Órgão Gerenciador da ARP: 
SECRETARIA DE DESENVOLVIMENTO SOCIAL E PROMOÇÃO DA CIDADANIA 
Órgãos Participantes: 
SECRETARIA DE PROTEÇÃO DEFESA CIVIL 
RECURSOS ORÇAMENTÁRIOS CONFORME ITEM 4 DO TERMO DE REFERÊNCIA.
PROGRAMA DE TRABALHO: 
CÓDIGO DE DESPESA: 
FONTE DE RECURSO: Estado do Rio de Janeiro
MUNICÍPIO DE ANGRA DOS REIS
Secretaria de Gestão de Suprimentos
Processo nº SEI-2025-06001343
4.2 – ORÇAMENTO SIGILOSO
5. CRITÉRIO DE JULGAMENTO
5.1 – O critério de julgamento da presente licitação é o MENOR PREÇO POR ITEM.
6. PRAZOS
6.1 – O prazo de vigência da Ata de Registro de Preços será de 12 (doze) meses, contados de sua assinatura,
podendo ser prorrogado, por igual período, desde que comprovado o preço vantajoso, a partir da data da
sua publicação no Boletim Oficial do Município de Angra dos Reis, acompanhada da divulgação no Portal
Nacional de Contratações Públicas. 
6.1.1  –  A entrega  será  parcelada.  O  prazo  de  entrega  dos  materiais, será  de  20  (vinte)  dias  corridos,
contados  do  recebimento  da  Ordem  de  Fornecimento  e/ou  Empenho  a  ser  emitida  pela  Secretaria
solicitante. 
6.2 – O prazo de vigência do contrato ou instrumento semelhante poderá ser prorrogado ou alterado nos
termos da Lei Federal nº 14.133/2021.
6.3 – A entrega do(s) bem(ns) que é(são) objeto do presente Edital deverá ocorrer no prazo e nas condições
previstas no Termo de Referência ou em documento próprio de autorização de fornecimento a ser expedido
pelo setor competente da  SECRETARIA DE DESENVOLVIMENTO SOCIAL E PROMOÇÃO DA CIDADANIA  e
ÓRGÃOS PARTICIPANTES.
6.4 – O prazo de garantia convencional por conta da CONTRATADA será de  12 (doze) meses a contar do
recebimento, na forma do Termo de Referência, sem prejuízo da garantia legal de adequação do produto.
6.5 – As licitantes ficam obrigadas a manter a validade da proposta por 60 (sessenta) dias, contados da data
da realização da licitação.
6.6 – Decorrido o prazo consignado no item anterior sem que tenha havido convocação para assinatura da
Ata de Registro de Preços, as licitantes ficarão liberadas de quaisquer compromissos assumidos.
6.7 – As Atas de Registro de Preços vigorarão pelo prazo de 12 (doze
de Gestão de Suprimentos
Processo nº SEI-2025-06001343
ANEXO I
TERMO DE REFERÊNCIAESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
TERMO     DE     REFERÊNCIA      
1   – DO   OBJETO      
FORMAÇÃO DE ATA DE REGISTRO DE PREÇOS DE AQUISIÇÃO DE MATERIAIS DE
CAMA, MESA  E BANHO  para  atender  as  necessidades  das  Secretarias  e  Autarquias  do
Município de Angra dos Reis.
Unidade Administrativa requisitante da ARP :
SECRETARIA DE DESENVOLVIMENTO SOCIAL E PROMOÇÃO DA CIDADANIA 
Órgão Gerenciador da ARP:
1. SECRETARIA DE DESENVOLVIMENTO SOCIAL E PROMOÇÃO DA CIDADANIA 
Órgãos Participantes:
1. Secretaria de Proteção e Defesa Civil - SPDC
1.1 - DAS     ESPECIFICAÇÕES     E   QUANTIDADES      
O(s) produto(s)/bem(ns) deverá(ão) obedecer à(s) seguinte(s) especificação(ões):
ITEM UND. CATMAT DESCRIÇÃO QUANT.  PORSECRETARIA QUANT.TOTAL
01 Unid. 607599
Capa  protetora  impermeável
para colchão:
Linha hospitalar com altura: 20
cm,  Largura:  78  cm,
Comprimento: 188 cm, material
napa azul hospitalar com zíper,
Anti-ácaros, fungos e bactérias.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP - 110 110
02 Unid. 607599
Capa  protetora  impermeável
para colchão infantil
Caiba em cama com dimensões
de 70 x 130 x 12 cm — Linha
hospitalar  com  material  Napa
azul hospitalar com zíper, Anti-
ácaros, fungos e bactérias.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP -  42 42
03 Unid. 255329 Travesseiro
Material:  Espuma  intética
SDSP - 100 100ESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
antialérgico  revestimento:
100%  algodão,  comprimento:
50  cm,  largura:  70  cm,
densidade:  20,  cor:  branco.
Qualidade similar ou superior a
marca Ortobom.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
04 Unid. 478446
Travesseiro para bebê
Anti-sufocante Látex Lavável -
Capa em Percal 180 fios
Material: 100%
Poliuretano Enchimento: Látex
sintético
Revestimento:  Revestido  65%
algodão e 35% Poliéster
Comprimento: 30 CM
Largura: 40 CM
Características  Adicionais:
Antialérgico,  Anti-Mofo  E
Antibactericida.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item.
SDSP - 32 32
05 Unid. 600406
Colchão Solteiro
Material:  placa  de  espuma
100%  poliuretano  D33  selada,
tecido  51%  viscose  e  49%
poliéster, revestimento no topo
com  plástico  impermeável,
Tecido  De  Revestimento:
Poliéster  Antiácaro  e
Antialérgico  Tamanho  Largura
X Comprimento: 0,78 X 1,88 M
Tamanho Altura: 20 CM.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP – 100
SPDC- 44 144
06 Unid. 614532 Colchão para cama infantil
Espuma mínima densidade 33,
composto  por  51%  viscose  e
49%  poliéster,  que  caiba  em
SDSP - 27 27ESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
cama  com dimensões  de 70 x
130  x  12  cm.  Características
Adicionais: Tecido Antialérgico
(Antifungo/Antimofo/Antiácaro
).
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
07 Unid. 614532
Colchão para berço
Espuma minima Densidade 33,
composto  por  51%  viscose  e
49% poliéster, dimensões: 60 x
130  x  12  cm  altura.
Características  Adicionais:
Tecido  Antialérgico
(Antifungo/Antimofo/Antiźcaro
).
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item.
SDSP - 27 27
08 Unid. 617740
Colcha de Solteiro Chenile Lisa
Tamanho:  1,40x2,30  cm,
Composição:85%  Algodão  e
15%  Poliéster,  gramatura
mínima  de  500  gim*.  Cores:
Rosa, azul, amarelo ou verde.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP -  100 100
09 Unid. 467254
Edredom Solteiro
100%  Algodão  Dupla  Face  -
Tamanho  2,10  m  x  1,50  m,
gramatura mínima de 500 g/m2,
Cores: Rosa, azul, amarelo  ou
verde.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP- 100 100
10 Kit 612541 KIT cobre leito 03 peças
01 Cobre-Leito 2,2 0m x 1,40
m,  gramatura  mínima  de  500.
01  Lençol  com  elástico  nas
extremidades, medida 1,90 m x
90 cm x 30 cm, 100% algodão
SDSP - 115 115ESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
percal mínimo de 200 fios
01 Porta Travesseiros 70 cm x
50 cm, no mínimo 200 fio Cor:
branco
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item.
11 Unid. 621195
Fronha para travesseiro
100%  algodão,  medidas
50x70cm  percal  200  Fios  -
Cores Azul/ Verde e branco.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP – 130 130
12 Unid. 621194
Toalha de banho
Alta  absorção,  macia
Composição:  100%  Algodão.
Tamanho:  150  x  80  cm,
gramatura mínima de 420 g/m2.
Cor: branco.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP – 400
SPDC- 3.551 3.951
13 Unid. 374810
Toalha de Rosto
Composição100%  Algodão
Tamanho:  50  cm  X  80  cm,
gramatura mínima de 420 gim*.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP - 100 100
14 Unid. 46723
Toalha de Banho Infantil  com
Capuz Soft
3 camadas em algodão com alta
absorção,  acabamento  em  víes
nas  extremidades,  Cor:
Amarela,  Branca  e  Verde  —
Tamanho:  70  cm  x  90  cm,
100%  algodão,  gramatura
mínima  de  420  g/m2.  Deve
obrigatoriamente  conter  as
especificações  completas  do
material na embalagem do item
SDSP - 65 65ESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
15 Unid. 614551
Lençol de elástico para cama
Tecido  100%  algodão  branco,
mínimo  de  200  fios,  tamanho
americano  Altura:  15  cm,
Largura: 78 cm, Comprimento:
188 cm.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP  - 270 270
16 Unid. 623431
Lençol de elástico para berço
Tecido  100%  algodão  branco,
mínimo  de  200  fios,  tamanho
americano  medidas:  130 cm x
70 cm x 12 cm.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP - 60 60
17 Kit 486488
Kit Berço 07 Peças
1  Edredom  de  Berço  1,50  m
comp. x 1,05 m larg.
1 Protetor Trança 3,05 m larg. x
15 cm alt.
1 Lençol de Cima 1,50 m comp.
x 1,05 m larg., no mínimo 180
fios;
1 Lençol de Baixo com Elástico
1,55 m comp. x 1 m larg. no
mínimo 180 fios,
1 Fronha 35 cm comp. x 28 cm
larg. no mínimo 180 fios;
1  Mosquiteiro  Varal  de  Tule
com Viés 1,30 m larg. x 1,50 m
alt. x 6 m comp.
1  Bandô  Decorativo  1,30  m
larg.  x  22  cm  alt.  Deve
obrigatoriamente  conter  as
especificações  completas  do
material na embalagem do item.
SDSP - 25 25
18 Unid. 612173 Manta fleece Solteiro
100% Poliéster
Medidas:  Largura  1,50  m
Comprimento:  2,20  m,
gramatura mínima de 400 g/m*
SDSP - 160 160ESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
com acabamento de bainha nas
extremidades,  cores:  azul-
marinho e rosa magenta.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
19 Unid. 481762
Manta  para  bebê  de  percal  e
sherpa
Sendo  dupla  face
hipoaIergênico,  110cm  x  90
cm,  no  mínimo  400g/m2 nas
cores:  azul,  verde,  amarelo  e
rosa.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP-50 50
20 Unid. 286184
Toalha  de  mesa  flanelada
térmica / impermeável lisa
Cor:  Branca  e  Vermelha  sem
estampa  tamanho:  4,00  m  X
1,40 m
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP - 44 44
21 Kit 467234
Toalha Fralda de bebê,
Cor: branca, medindo70 x 120
cm,  100%  algodão,  Dupla
camada  de  tecido  sarja,
hipoalergênica,  Absorventes  e
macias, Kit com 3 unidades.
Alvejadas  e  sem  substâncias
gordurosas, ou similar a marca
Cremer.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP - 90 90
22 Kit 614597 Pano de boca para bebês
Medindo  35  cm  x  35  cm,
branco,  tecido  duplo  e
respirável,  100%  algodão  com
bainha  nas  extremidades,  Kit
com 3 unidades.
SDSP- 140 140ESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
23 Unid. 416485
Tapete  toalha  Piso  para
banheiro
Medida: 50 cm x 70 cm
Material  100%  Algodão,
gramatura mínima de 400 g/m*
Cor: Branco
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP- 130 130
24 Unid. 452419
Protetor de travesseiro
Medidas: 70 cm x 50 cm, tecido
percal 200 fios, 100% algodão,
impermeável  impede  a
passagem  de  líquido,
Fechamento  com  zíper,
Algodão  natural,  sem  ruídos,
hipoalergênico.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP - 100 100
25 Unid. 452419
Protetor de travesseiro
Medindo:  30  cm  x  40  cm,
tecido  percal  200  fios,  100%
algodão, impermeável impede a
passagem  de  líquido,
Fechamento  com  zíper,
Algodão  natural,  sem  ruídos,
hipoalergênico.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP-80 80
26 Unid. 623467 Cortina  com  ilhós  redondo
branco para varão de 28 mm
Tecido  88%  poliéster  e  12%
linho,  bloqueia  100%  da
claridade  com  blackout  sem
voil  sendo  2  partes  com
acabamento  em  bainha  nas
extremidades,  para  varão
simples  -  Cor:  Bege/Creme
claro,  Medidas:  Medidas:
SDSP-20 20ESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
largura – 2,80 m x altura – 1,80
m.
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
27 Unid. 623467
Cortina  com  ilhós  redondo
branco para varão de 28 mm
Tecido  88%  poliéster  e  12%
linho,  bloqueia  100%  da
claridade  com  blackout  sem
voil  sendo  2  partes  com
acabamento  em  bainha  nas
extremidades,  para  varão
simples  -  Cor:  Bege/Creme
claro,
Medidas:  largura  2,60  m  x
altura 1,50 m
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP-04 04
28 Unid. 623467
Cortina  com  ilhós  redondo
branco para varão de 28 mm
Tecido  88%  poliéster  e  12%
linho,  bloqueia  100%  da
claridade  com  blackout  sem
voil  sendo  2  partes  com
acabamento  em  bainha  nas
extremidades,  para  varão
simples  -  Cor:  Bege/Creme
claro.
Medidas: Medidas:  altura  2,20
m x largura 2,50 m
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP-08 08
29 Unid. 623467 Cortina  com  ilhós  redondo
branco para varão de 28 mm
Tecido  88%  poliéster  e  12%
linho,  bloqueia  100%  da
claridade  com  blackout  sem
voil  sendo  2  partes  com
acabamento  em  bainha  nas
extremidades,  para  varão
simples  -  Cor:  Bege/Creme
SDSP-12
SPDC- 06
18ESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
claro.
Medidas:  altura  1,50  m  x
largura 2,20 m
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
30 Unid. 623467
Cortina  com  ilhós  redondo
branco para varão de 28 mm
Tecido  88%  poliéster  e  12%
linho,  bloqueia  100%  da
claridade  com  blackout  sem
voil  sendo  2  partes  com
acabamento  em  bainha  nas
extremidades,  para  varão
simples  -  Cor:  Bege/Creme
claro,
Medidas:  1,40  m  x  1,60  m  –
altura x largura
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP-20 20
31 Kit 611062
Kit Varão de ferro/pvc 28 mm
Composto  por  2  ponteiras,  2
suportes,  buchas  e  parafusos
quantidade  exata  para
instalação,  1  emenda  (junção),
2 partes com unidades de 1,50
m., totalizando o comprimento
3 m.. Cor: Castanho claro
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP-45 45
32 Kit 611062
Kit Varão de ferro/pvc 28 mm
Composto  por  2  ponteiras,  2
suportes,  buchas  e  parafusos
quantidade  exata  para
instalação,  o  varão  deve
suportar  cortina  de
comprimento  2  m.  Cor:
Castanho  claro.  Deve
obrigatoriamente  conter  as
especificações  completas  do
material na embalagem do item
SDSP-10
SPDC- 06 16
33 Kit 611062 Kit Varão de ferro/pvc 28 mm SDSP-20 20ESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
Composto  por  2  ponteiras,  2
suportes,  buchas  e  parafusos
quantidade  exata  para
instalação,  o  varão  deve
suportar  cortina  de
comprimento  1,50  m.  Cor:
Castanho claro
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
34 Unid. 600794
Estofado  almofadado  para
banco de madeira de espuma
Material  do  tecido:  protegidas
por  resina  extremamente
resistente original impermeável
com amarras para fixar melhor
ao banco medidas: 60 cm x 50
cm
Cor:  verde-oliva,  amarela
mostarda e terra cota
Deve  obrigatoriamente  conter
as especificações completas do
material na embalagem do item
SDSP-30 30
35 Unid. 35066
Kit  cobre-leito  solteiro  liso,
matelassado,  composto  por  2
(duas) peças, confeccionado em
tecido 100% poliéster, com 200
fios, disponível nas cores azul,
bege,  verde,  rosê,  marrom  e
outras,  conforme
disponibilidade.
SDSP-130 130
1.2 Em caso de divergência entre a descrição contida no código CATSER e da DESCRIÇÃO
ESPECIFICA do Termo de Referência, prevalecerá a DESCRIÇÃO ESPECIFICA do Termo. 
2- CRITÉRIO DE JULGAMENTO
2.1 – Para julgamento e classificação das propostas, será dado o critério de MENOR VALOR
POR ITEM.
2.2 – Dispostos da licitação
2.2.1- MODO DE DISPUTA: ABERTOESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
2.2.2- COTA PARA ME E EPP: NÃO  
2.2.3- PERMISSÃO DE ADESÃO:   SIM      
2.2.4- CONTRATO:   N ÃO      
2.2.5- ORÇAMENTO: SIGILOSO  
3             –         DA     JUSTIFICATIVA     E         RESULTADOS         ESPERADOS      
3.1 - O presente Termo de Referência tem por objetivo nortear a contratação de empresa para
fornecimento de materiais de cama, mesa e banho, destinadas ao atendimento das Unidades
Administrativas Diretas e Indiretas, deste município, visando uma economicidade de escala,
bem como efetuar  a seleção  de proposta mais vantajosa  para a  Administração  Pública.  É
importante salientar a necessidade de dar cumprimento a legislação vigente – Lei Nacional de
Licitação – 14.133/21 e demais alterações;
3.2 - Considerando que este processo trata-se de uma aquisição unificada envolvendo múltiplos
órgãos  participantes,  informamos  que  as  justificativas  individuais  para  a  participação  e  a
necessidade  dos  itens/serviços  solicitados  foram  devidamente  elaboradas  por  cada  órgão
envolvido e encontram-se devidamente anexadas aos autos do processo. Tal medida visa garantir
a transparência, a individualização da demanda e a demonstração da  necessidade de cada
participante, conforme previsto nas normas que regem as contratações públicas, em especial os
princípios  da  legalidade,  eficiência  e  economicidade.  Dessa  forma,  todas  as  justificativas
específicas estão disponíveis para consulta no presente processo, possibilitando a adequada
análise técnica e jurídica da contratação unificada.
3.3 - A quantidade descrita no item 1.1 é estimada, podendo ser utilizada em sua totalidade ou
não.
3.4 – Este termo tem a finalidade de nortear a contratação de serviços primando pela
observância dos preços praticados no mercado, conforme dispõe a Lei Nacional de Licitação
em seus respectivos  artigos. Vale atentar que, as quantidades ofertadas através do Termo de
Referência  retromencionado, tem por origem os levantamentos realizados nas secretarias
requisitantes e de forma a contemplar os exercícios de 2025/2026.
4     –     DO     RECURSO     ORÇAMENTÁRIO      
As despesas decorrentes do contrato a ser celebrado com a(s) licitante(s) vencedora(s), correrão
por conta da dotação orçamentária, sob as rubricas:
Secretaria de Desenvolvimento Social e Promoção da Cidadania 
26.2601.08.244.0136.2706.339030.16600000 / 26.2601.08.244.0136.2706.449052.16610000 
26.2601.08.243.0136.2705.339030.16600000 / 26.2601.08.243.0136.2705.449052.16610000 
Secretaria de Proteção e Defesa Civil
Ficha: 20250511ESTADO DO RIO DE JANEIRO
MUNICÍPIO DE ANGRA DOS REIS
Dotação Orçamentária: 20.2026.04.122.0204.2002.339030.15000000
Ficha: 20250526
Dotação Orçamentária: 20.2026.04.122.0204.2161.339039.15000000
5– DOS     PRAZOS     E     VIGÊNCIA     DA     ATA      
5.1 – O prazo de vigência da Ata de Registro de Preços será de 12 (doze) meses, contados
de sua assinatura, podendo ser prorrogado, por igual período, desde que comprovado o preço
vantajoso, a partir da data da sua publicação no Boletim Oficial do Município de  Angra dos
Reis, acompanhada da divulgação no Portal Nacional de Contratações Públicas.
5.2 – A entrega será parcelada . O prazo de entrega dos materiais, será de 20 (VINTE) dias
corridos, contados do recebimento da Ordem de Fornecimento e/ou Empenho a ser emitida
pela Secretaria solicitante.
5.3 – O prazo de validade será de 90 (noventa) dias, contados da data de entrega da proposta.
5.4 – O pagamento será efetuado no prazo de 30 (trinta) dias, contados da data de emissão da Nota de
Liquidação, sendo esta condicionada à apresentação do documento de cobrança na  Secretaria
solicitando, cumpridas as formalidades legais e contratuais previstas, mediante crédito em conta-
corrente da CONTRATADA.
5.5 –  A  Administração  reserva-se  ao  direito  de  não  efetuar  o  pagamento,  se  o(s)
produto(s)/bem(ns) estiverem em desacordo com as especificações constantes do Ed`;

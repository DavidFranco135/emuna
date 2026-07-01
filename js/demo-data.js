// ============================================================
// EMUNÁ · Dados de demonstração (fallback)
// ============================================================
// Usados automaticamente quando o Firebase ainda não está
// configurado, ou quando uma coleção do Firestore está vazia.
// Sirvam de referência para o FORMATO esperado dos documentos.
// ============================================================

export const demoBanners = [
  {
    id: "demo-1",
    title: "Feito à mão, com fé e delicadeza",
    subtitle: "Peças em crochê e bijuterias para quem ama o singular",
    image:
      "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?q=80&w=1600&auto=format&fit=crop",
    ctaLabel: "Ver coleção",
    ctaLink: "#destaques",
    active: true,
    order: 1,
  },
  {
    id: "demo-2",
    title: "Canecas Escola de Cura",
    subtitle: "Edição especial, peças limitadas",
    image:
      "https://images.unsplash.com/photo-1517663995082-cdc88c92c8ff?q=80&w=1600&auto=format&fit=crop",
    ctaLabel: "Conhecer",
    ctaLink: "#novidades",
    active: true,
    order: 2,
  },
  {
    id: "demo-3",
    title: "Livros que tocam a alma",
    subtitle: "Curadoria própria, leituras que ficam",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1600&auto=format&fit=crop",
    ctaLabel: "Explorar",
    ctaLink: "#mais-vendidos",
    active: true,
    order: 3,
  },
];

export const demoPromoBanners = [
  {
    id: "promo-1",
    title: "Frete grátis acima de R$ 150",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop",
    link: "#",
  },
  {
    id: "promo-2",
    title: "Nova coleção de bijuterias",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop",
    link: "#",
  },
];

export const demoCategories = [
  {
    id: "croche",
    name: "Crochê",
    icon: "🧶",
    image:
      "https://images.unsplash.com/photo-1582142306909-195724d33ffc?q=80&w=800&auto=format&fit=crop",
    order: 1,
  },
  {
    id: "bijuterias",
    name: "Bijuterias",
    icon: "💍",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    order: 2,
  },
  {
    id: "canecas",
    name: "Canecas Escola de Cura",
    icon: "☕",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop",
    order: 3,
  },
  {
    id: "livros",
    name: "Livros",
    icon: "📖",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop",
    order: 4,
  },
  {
    id: "digitais",
    name: "Produtos Digitais",
    icon: "✦",
    image:
      "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?q=80&w=800&auto=format&fit=crop",
    order: 5,
  },
];

export const demoProducts = [
  {
    id: "p1",
    name: "Bolsa de crochê Amêndoa",
    shortDescription: "Algodão egípcio, alça dupla, forro interno",
    description:
      "Bolsa feita à mão em crochê com fio de algodão egípcio, ponto baixo cerrado para mais firmeza. Forro interno em tecido de algodão com bolso para celular, alça dupla em couro sintético e fecho magnético. Cada peça leva cerca de 18 horas de trabalho manual.",
    price: 189.9,
    promoPrice: 159.9,
    images: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=700&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=900&auto=format&fit=crop",
    ],
    categoryId: "croche",
    featured: true,
    bestSeller: true,
    isNew: false,
    stock: 8,
    sku: "EMU-CRC-001",
    weight: 0.45,
    dimensions: "32cm x 28cm x 12cm",
    rating: 4.9,
    reviews: [
      { name: "Marina C.", rating: 5, text: "Surpreendeu pela qualidade do acabamento.", date: "2026-04-12" },
      { name: "Paula R.", rating: 5, text: "Linda, recebi rapidinho e bem embalada.", date: "2026-03-02" },
    ],
  },
  {
    id: "p2",
    name: "Brincos Filó dourado",
    shortDescription: "Banho de ouro 18k, fio italiano",
    description:
      "Brincos em formato gota, com banho de ouro 18k e acabamento fosco. Fecho tipo tarraxa, hipoalergênico. Acompanham saquinho para presente.",
    price: 79.9,
    promoPrice: null,
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=900&auto=format&fit=crop",
    ],
    categoryId: "bijuterias",
    featured: true,
    bestSeller: false,
    isNew: true,
    stock: 14,
    sku: "EMU-BIJ-014",
    weight: 0.02,
    dimensions: "4cm x 1,5cm",
    rating: 4.8,
    reviews: [{ name: "Bruna L.", rating: 5, text: "Leves e super delicados.", date: "2026-05-20" }],
  },
  {
    id: "p3",
    name: "Caneca Escola de Cura — Coragem",
    shortDescription: "Porcelana 300ml, edição limitada",
    description:
      "Caneca em porcelana branca, 300ml, com estampa exclusiva da coleção Escola de Cura. Vai ao micro-ondas e lava-louças. Edição limitada e numerada.",
    price: 64.9,
    promoPrice: null,
    images: [
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=900&auto=format&fit=crop",
    ],
    categoryId: "canecas",
    featured: true,
    bestSeller: true,
    isNew: false,
    stock: 23,
    sku: "EMU-CAN-007",
    weight: 0.35,
    dimensions: "9cm x 11cm",
    rating: 5.0,
    reviews: [
      { name: "Juliana P.", rating: 5, text: "Comprei de presente e acabei comprando outra pra mim.", date: "2026-06-01" },
    ],
  },
  {
    id: "p4",
    name: "Manta Raiz em crochê",
    shortDescription: "Lã mesclada, 1,40m x 1,80m",
    description:
      "Manta artesanal em lã mesclada, ponto concha, ideal para sofá ou cama de casal. Trabalhada em pontos unidos manualmente, sem emendas visíveis.",
    price: 349.9,
    promoPrice: 299.9,
    images: [
      "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?q=80&w=900&auto=format&fit=crop",
    ],
    categoryId: "croche",
    featured: false,
    bestSeller: true,
    isNew: false,
    stock: 4,
    sku: "EMU-CRC-009",
    weight: 1.2,
    dimensions: "140cm x 180cm",
    rating: 4.7,
    reviews: [],
  },
  {
    id: "p5",
    name: "Colar Semente de fé",
    shortDescription: "Prata 925, pingente artesanal",
    description:
      "Colar em prata 925 com pingente artesanal em formato de semente. Corrente ajustável de 40 a 45cm. Vem em caixinha pronta para presente.",
    price: 129.9,
    promoPrice: null,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=900&auto=format&fit=crop",
    ],
    categoryId: "bijuterias",
    featured: false,
    bestSeller: false,
    isNew: true,
    stock: 11,
    sku: "EMU-BIJ-021",
    weight: 0.03,
    dimensions: "Corrente 40-45cm",
    rating: 4.9,
    reviews: [],
  },
  {
    id: "p6",
    name: "Caderno de gratidão — e-book",
    shortDescription: "PDF + áudio guiado, entrega imediata",
    description:
      "E-book interativo com 30 dias de exercícios de gratidão, mais um áudio guiado de 12 minutos para meditação. Entrega automática por e-mail após a compra.",
    price: 39.9,
    promoPrice: null,
    images: [
      "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?q=80&w=900&auto=format&fit=crop",
    ],
    categoryId: "digitais",
    featured: false,
    bestSeller: false,
    isNew: true,
    stock: 999,
    sku: "EMU-DIG-002",
    weight: 0,
    dimensions: "Produto digital",
    rating: 4.6,
    reviews: [],
  },
  {
    id: "p7",
    name: "Tapete oval de crochê",
    shortDescription: "Fio de malha reciclado, antiderrapante",
    description:
      "Tapete artesanal em fio de malha reciclado, trançado à mão em formato oval. Base antiderrapante costurada por baixo. Lavável à mão.",
    price: 159.9,
    promoPrice: null,
    images: [
      "https://images.unsplash.com/photo-1582142306909-195724d33ffc?q=80&w=900&auto=format&fit=crop",
    ],
    categoryId: "croche",
    featured: false,
    bestSeller: false,
    isNew: false,
    stock: 6,
    sku: "EMU-CRC-015",
    weight: 0.9,
    dimensions: "60cm x 90cm",
    rating: 4.5,
    reviews: [],
  },
  {
    id: "p8",
    name: "Pulseira Raiz trançada",
    shortDescription: "Couro e miçangas, ajuste por nó corrediço",
    description:
      "Pulseira trançada à mão com fio encerado e miçangas de vidro. Ajuste por nó corrediço, serve em praticamente qualquer pulso.",
    price: 49.9,
    promoPrice: 39.9,
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=900&auto=format&fit=crop",
    ],
    categoryId: "bijuterias",
    featured: false,
    bestSeller: true,
    isNew: false,
    stock: 0,
    sku: "EMU-BIJ-030",
    weight: 0.01,
    dimensions: "Ajustável",
    rating: 4.6,
    reviews: [],
  },
  {
    id: "p9",
    name: "Caneca Escola de Cura — Recomeço",
    shortDescription: "Porcelana 300ml, edição limitada",
    description:
      "Segunda estampa da coleção Escola de Cura, com a palavra 'Recomeço'. Porcelana 300ml, vai ao micro-ondas e lava-louças.",
    price: 64.9,
    promoPrice: null,
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=900&auto=format&fit=crop",
    ],
    categoryId: "canecas",
    featured: false,
    bestSeller: false,
    isNew: true,
    stock: 17,
    sku: "EMU-CAN-008",
    weight: 0.35,
    dimensions: "9cm x 11cm",
    rating: 4.9,
    reviews: [],
  },
  {
    id: "p10",
    name: "Devocional 90 dias — livro físico",
    shortDescription: "Capa dura, 220 páginas",
    description:
      "Livro devocional com reflexões diárias para 90 dias, capa dura, acabamento em hot stamping dourado, 220 páginas em papel offset.",
    price: 89.9,
    promoPrice: null,
    images: [
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=900&auto=format&fit=crop",
    ],
    categoryId: "livros",
    featured: true,
    bestSeller: false,
    isNew: false,
    stock: 31,
    sku: "EMU-LIV-003",
    weight: 0.4,
    dimensions: "21cm x 14cm x 2cm",
    rating: 4.8,
    reviews: [],
  },
];

export const demoTestimonials = [
  {
    id: "t1",
    name: "Marina Costa",
    text: "Cada peça chega com um cuidado que eu nunca tinha visto em outra loja. A bolsa de crochê é ainda mais linda pessoalmente.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Juliana Prado",
    text: "Comprei a caneca da Escola de Cura de presente e acabei comprando uma para mim também. Atendimento impecável.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Renata Alves",
    text: "Entrega rápida, embalagem linda e o brinco é ainda mais delicado ao vivo. Já é a terceira compra.",
    rating: 5,
  },
];

export const demoTransactions = [
  { id: "t1", type: "saida", description: "Compra de fios e materiais", amount: 320, category: "Insumos", date: "2026-06-05" },
  { id: "t2", type: "saida", description: "Embalagens personalizadas", amount: 145.5, category: "Embalagem", date: "2026-06-12" },
  { id: "t3", type: "saida", description: "Anúncios Instagram", amount: 200, category: "Marketing", date: "2026-06-20" },
  { id: "t4", type: "saida", description: "Frete de reposição de estoque", amount: 89.9, category: "Logística", date: "2026-06-26" },
];

export const demoOrders = [
  {
    id: "EMU-7F3A2K",
    customerName: "Marina Costa",
    customerEmail: "marina.costa@email.com",
    customerPhone: "5521988887701",
    items: [{ name: "Bolsa de crochê Amêndoa", qty: 1, price: 159.9 }],
    total: 159.9,
    status: "enviado",
    payment: "pix",
    trackingCode: "BR123456789BR",
    createdAt: "2026-06-24T14:22:00",
  },
  {
    id: "EMU-9C1B8X",
    customerName: "Juliana Prado",
    customerEmail: "juliana.prado@email.com",
    customerPhone: "5521988887702",
    items: [
      { name: "Caneca Escola de Cura — Coragem", qty: 2, price: 64.9 },
      { name: "Colar Semente de fé", qty: 1, price: 129.9 },
    ],
    total: 259.7,
    status: "pago",
    payment: "cartao",
    trackingCode: "",
    createdAt: "2026-06-27T09:10:00",
  },
  {
    id: "EMU-2D5E91",
    customerName: "Renata Alves",
    customerEmail: "renata.alves@email.com",
    customerPhone: "5521988887703",
    items: [{ name: "Brincos Filó dourado", qty: 1, price: 79.9 }],
    total: 79.9,
    status: "pendente",
    payment: "boleto",
    trackingCode: "",
    createdAt: "2026-06-29T18:45:00",
  },
  {
    id: "EMU-4G7H22",
    customerName: "Bruna Lima",
    customerEmail: "bruna.lima@email.com",
    customerPhone: "5521988887704",
    items: [{ name: "Manta Raiz em crochê", qty: 1, price: 299.9 }],
    total: 299.9,
    status: "cancelado",
    payment: "pix",
    trackingCode: "",
    createdAt: "2026-06-18T11:00:00",
  },
];

export const demoCoupons = [
  { id: "coupon-1", code: "EMUNA10", type: "percent", value: 10, label: "10% de desconto" },
  { id: "coupon-2", code: "BEMVINDA", type: "percent", value: 15, label: "15% de desconto — primeira compra" },
  { id: "coupon-3", code: "FRETEGRATIS", type: "shipping", value: 0, label: "Frete grátis" },
];

export const demoCustomerFlags = {};

export const demoSettings = {
  storeName: "Emuná",
  whatsapp: "5521999999999",
  pixKey: "",
  instagram: "https://instagram.com/emuna",
  facebook: "https://facebook.com/emuna",
  email: "contato@emuna.com.br",
  phone: "(21) 99999-9999",
  address: "Niterói, RJ — Brasil",
  aboutEyebrow: "Nossa história",
  aboutTitle: "Cada ponto carrega uma intenção",
  aboutText:
    "A Emuná nasceu da vontade de transformar fé, cuidado e delicadeza em peças que se possa tocar. Cada item em crochê é feito ponto a ponto, cada bijuteria é escolhida com carinho, e cada caneca da Escola de Cura carrega uma mensagem para o seu dia.\nAcreditamos que um produto bem-feito é também um gesto de afeto — para quem compra e para quem recebe de presente.",
  aboutImage:
    "https://images.unsplash.com/photo-1556760544-74068565f05c?q=80&w=900&auto=format&fit=crop",
};

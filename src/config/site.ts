import heroShowroom from '../assets/hero-showroom-v2.png'

const whatsapp = import.meta.env.VITE_WHATSAPP ?? ''

export const siteConfig = {
  seo: {
    title: 'Monky Veículos',
    description: 'Veículos revisados, com procedência e as melhores condições do mercado.',
    language: 'pt-BR',
  },
  tenant: {
    id: import.meta.env.VITE_TENANT_ID ?? '',
    apiUrl: import.meta.env.VITE_API_URL ?? '',
  },
  brand: {
    name: 'Monky',
    segment: 'Veículos',
    fullName: 'Monky Veículos',
    slogan: 'Confiança em cada km',
    logo: '/monky-mark.png',
    favicon: '/monky-mark.png',
  },
  theme: {
    primary: '#e6383f',
    primaryDark: '#b71d25',
    dark: '#060a0e',
    light: '#f6f4f1',
  },
  assets: {
    hero: heroShowroom,
    dealership: '/concessionaria.png',
  },
  contact: {
    whatsapp,
    phone: '',
    email: '',
    address: '',
  },
  social: {
    instagram: '',
    facebook: '',
    youtube: '',
  },
  developer: {
    label: 'Desenvolvido por',
    name: 'Monky Soluções',
    url: 'https://monkysolucoes.vercel.app',
    logo: '/monky-solucoes.png',
  },
  navigation: {
    vehicles: 'Veículos',
    financing: 'Financiamento',
    sellCar: 'Vender meu carro',
    about: 'Sobre nós',
    favorites: 'Favoritos',
    whatsapp: 'Falar no WhatsApp',
    contact: 'Contato',
  },
  home: {
    hero: {
      badge: 'Confiança em cada km',
      titleBefore: 'Seu próximo',
      titleHighlight: 'carro',
      titleAfter: 'está aqui.',
      description: 'Veículos revisados, com procedência e as melhores condições do mercado.',
      primaryAction: 'Ver estoque',
      secondaryAction: 'Vender meu carro',
      metrics: [
        { title: '+500', description: 'veículos vendidos' },
        { title: 'Atendimento', description: 'especializado' },
        { title: 'Compra segura', description: 'e sem burocracia' },
      ],
    },
    highlights: {
      title: 'Veículos em',
      titleHighlight: 'destaque',
      viewAll: 'Ver todos os veículos',
      calls: [
        { title: 'Financiamento', description: 'As melhores taxas e parcelas com os principais bancos.', action: 'Simular agora', route: '/financiamento' },
        { title: 'Quer vender seu carro?', description: 'Avaliação rápida, justa e sem complicação.', action: 'Faça sua avaliação', route: '/vender-meu-carro' },
        { title: 'Troca com vantagem', description: 'Seu usado como parte do pagamento.', action: 'Saiba mais', route: '/catalogo' },
      ],
    },
    catalogCta: {
      title: 'Encontre o carro ideal para o seu momento.',
      description: 'Seja para o dia a dia, trabalho ou família, temos o veículo certo para você.',
      action: 'Ver catálogo completo',
    },
    institutional: {
      statement: 'Mais que carros, realizamos histórias.',
      title: 'Por que escolher a Monky Veículos?',
      benefits: [
        { title: 'Veículos revisados', description: 'e com garantia' },
        { title: 'Atendimento', description: 'especializado' },
        { title: 'Procedência', description: 'comprovada' },
        { title: 'Processo seguro', description: 'e transparente' },
      ],
      testimonial: {
        rating: '★★★★★',
        text: '“Atendimento excelente e carros de qualidade. Fui muito bem atendido do início ao fim!”',
        author: 'Cliente Monky',
        detail: 'Compra verificada',
      },
    },
  },
  catalog: {
    priceRanges: [
      { label: 'Até R$ 50 mil', value: '50000' },
      { label: 'Até R$ 80 mil', value: '80000' },
      { label: 'Até R$ 120 mil', value: '120000' },
      { label: 'Até R$ 200 mil', value: '200000' },
    ],
    heroPriceRanges: [
      { label: 'Qualquer valor', value: '' },
      { label: 'Até R$ 80 mil', value: '80000' },
      { label: 'Até R$ 120 mil', value: '120000' },
      { label: 'Até R$ 200 mil', value: '200000' },
    ],
    fuels: [
      { label: 'Gasolina', value: 'GASOLINA' },
      { label: 'Etanol', value: 'ETANOL' },
      { label: 'Flex', value: 'FLEX' },
      { label: 'Diesel', value: 'DIESEL' },
      { label: 'Elétrico', value: 'ELETRICO' },
      { label: 'Híbrido', value: 'HIBRIDO' },
    ],
    transmissions: ['MANUAL', 'AUTOMATICO', 'CVT'],
    years: ['2026', '2024', '2022', '2020'],
    brands: [
      { nome: 'Chevrolet', logo: '/marcas/chevrolet.svg' },
      { nome: 'Citroën', logo: '/marcas/citroen.svg' },
      { nome: 'Fiat', logo: '/marcas/fiat.svg' },
      { nome: 'Ford', logo: '/marcas/ford.svg' },
      { nome: 'Honda', logo: '/marcas/honda.svg' },
      { nome: 'Hyundai', logo: '/marcas/hyundai.svg' },
      { nome: 'Jeep', logo: '/marcas/jeep.svg' },
      { nome: 'Kia', logo: '/marcas/kia.svg' },
      { nome: 'Nissan', logo: '/marcas/nissan.svg' },
      { nome: 'Peugeot', logo: '/marcas/peugeot.svg' },
      { nome: 'Renault', logo: '/marcas/renault.svg' },
      { nome: 'Toyota', logo: '/marcas/toyota.svg' },
      { nome: 'Volkswagen', logo: '/marcas/volkswagen.svg' },
      { nome: 'Audi', logo: '/marcas/audi.svg' },
      { nome: 'BMW', logo: '/marcas/bmw.svg' },
      { nome: 'Mercedes-Benz', logo: '/marcas/mercedes-benz.svg' },
    ],
  },
  financing: {
    eyebrow: 'Crédito sob medida',
    title: 'Simule seu',
    titleHighlight: 'financiamento',
    description: 'Receba uma análise rápida e descubra as melhores condições para conquistar seu próximo veículo.',
    sectionTitle: 'Por que financiar conosco?',
    benefits: [
      { title: 'Aprovação rápida', description: 'Retorno ágil para sua análise de crédito.' },
      { title: 'Parcelas flexíveis', description: 'Opções adaptadas ao seu orçamento.' },
      { title: 'Atendimento personalizado', description: 'Nossa equipe ajuda você durante todo o processo.' },
    ],
    privacy: 'Seus dados são protegidos e usados apenas para análise de crédito.',
    terms: ['12', '24', '36', '48', '60'],
    defaultTerm: '36',
    successTitle: 'Simulação recebida!',
    successText: 'Nossa equipe analisará seu perfil e entrará em contato com as melhores condições disponíveis.',
  },
  sellCar: {
    eyebrow: 'Avaliação rápida e transparente',
    title: 'Venda seu carro com',
    titleHighlight: 'segurança',
    description: 'Preencha os dados abaixo para receber uma avaliação rápida do seu veículo.',
    sectionTitle: 'Por que vender conosco?',
    benefits: [
      { title: 'Avaliação rápida', description: 'Retorno rápido para análise do seu veículo.' },
      { title: 'Processo seguro', description: 'Negociação transparente e sem burocracia.' },
      { title: 'Melhor valorização', description: 'Buscamos a melhor proposta para seu carro.' },
    ],
    privacy: 'Seus dados são protegidos e utilizados apenas para contato e avaliação do veículo.',
    conditions: ['Excelente', 'Bom', 'Regular'],
    defaultCondition: 'Bom',
    successTitle: 'Recebemos seu veículo!',
    successText: 'Nossa equipe analisará as informações enviadas e entrará em contato com você em breve.',
  },
} as const

export function getWhatsAppUrl(message?: string) {
  if (!siteConfig.contact.whatsapp) return '#'

  const baseUrl = `https://wa.me/${siteConfig.contact.whatsapp}`
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl
}

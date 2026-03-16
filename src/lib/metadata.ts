import { Metadata } from 'next';

export const baseMetadata: Metadata = {
  title: {
    default: 'Vivaz Barbearia Avenue',
    template: '%s | Vivaz Barbearia Avenue',
  },
  description: 'Agendamento online para barbearia de luxo. Agende seu horário com os melhores barbeiros da cidade.',
  keywords: [
    'barbearia',
    'agendamento',
    'barbeiro',
    'corte',
    'barba',
    'serviços de beleza',
    'São Paulo',
  ],
  authors: [
    {
      name: 'Vivaz Barbearia Avenue',
      url: 'https://vivazbarbearia.com',
    },
  ],
  creator: 'Vivaz Barbearia Avenue',
  publisher: 'Vivaz Barbearia Avenue',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://vivazbarbearia.com',
    siteName: 'Vivaz Barbearia Avenue',
    title: 'Vivaz Barbearia Avenue - Agendamento Online',
    description: 'Agende seu horário com os melhores barbeiros. Serviços premium de corte, barba e tratamentos capilares.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vivaz Barbearia Avenue',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vivaz Barbearia Avenue',
    description: 'Agendamento online para barbearia de luxo',
    images: ['/og-image.jpg'],
    creator: '@vivazbarbearia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://vivazbarbearia.com',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vivaz Barbearia',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  themeColor: '#D4AF37',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export const pageMetadata = {
  home: {
    title: 'Início',
    description: 'Bem-vindo à Vivaz Barbearia Avenue. Agende seu horário agora.',
  },
  agendar: {
    title: 'Agendar Horário',
    description: 'Escolha um serviço, barbeiro e horário disponível para agendar seu atendimento.',
  },
  historico: {
    title: 'Meu Histórico',
    description: 'Veja todos os seus agendamentos, avaliações e histórico de atendimentos.',
  },
  perfil: {
    title: 'Meu Perfil',
    description: 'Gerencie suas informações pessoais e preferências de contato.',
  },
  admin: {
    title: 'Painel Administrativo',
    description: 'Gerencie barbeiros, serviços, agendamentos e configurações da barbearia.',
  },
  barbeiro: {
    title: 'Painel do Barbeiro',
    description: 'Visualize sua agenda, registre atendimentos e acompanhe seus ganhos.',
  },
};

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

// --- Constants ---
const WHATSAPP_NUMBER = "5511941582643";
const WHATSAPP_NUMBER_FORMAT = "(11) 94158-2643";
const ESCRITORIO_NOME = "Oliveira Mendes Advocacia";
const STAFF_PASS = "adv929130#";
const MASTER_CRED = { user: "admin", pass: "om2024#" };

// --- Types ---
interface Service {
  id: number;
  category: string;
  name: string;
  desc: string;
  price: string;
  images: string[];
  online: boolean;
  presencial: boolean;
  code?: string;
  createdAt?: string;
}

interface Staff {
  fullName: string;
  firstName: string;
  login: string;
  area: string;
}

const DEFAULT_SERVICES: Service[] = [
  { 
    id: 1, 
    category: 'Direito Civil', 
    name: 'Consultoria em Contratos', 
    desc: 'Análise, elaboração e revisão de contratos civis e comerciais. Proteja seus negócios com documentos jurídicos seguros e claros.', 
    price: 'R$ 450,00', 
    images: [
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800'
    ],
    online: true,
    presencial: true,
    code: 'CIV001'
  },
  { 
    id: 2, 
    category: 'Direito Trabalhista', 
    name: 'Reclamação Trabalhista', 
    desc: 'Representação em processos trabalhistas para empregados e empregadores. Assessoria completa desde a reclamação até a execução.', 
    price: 'Consulte', 
    images: [
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800'
    ],
    online: true,
    presencial: true,
    code: 'TRAB001'
  },
  { 
    id: 3, 
    category: 'Direito Previdenciário', 
    name: 'Aposentadoria e Benefícios', 
    desc: 'Análise de tempo de contribuição, concessão de aposentadorias (idade, tempo, especial), pensões e outros benefícios do INSS.', 
    price: 'R$ 380,00', 
    images: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=800'
    ],
    online: true,
    presencial: true,
    code: 'PREV001'
  },
  { 
    id: 4, 
    category: 'Direito Empresarial', 
    name: 'Abertura de Empresa', 
    desc: 'Constituição de sociedades empresariais, escolha do melhor regime tributário, registro em órgãos competentes e compliance inicial.', 
    price: 'R$ 890,00', 
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
    ],
    online: true,
    presencial: true,
    code: 'EMP001'
  },
  { 
    id: 5, 
    category: 'Direito de Família', 
    name: 'Divórcio e Guarda', 
    desc: 'Processos de divórcio (consensual e litigioso), regulamentação de guarda, visitas, pensão alimentícia e partilha de bens.', 
    price: 'Consulte', 
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
    ],
    online: true,
    presencial: true,
    code: 'FAM001'
  },
  { 
    id: 6, 
    category: 'Direito Tributário', 
    name: 'Planejamento Tributário', 
    desc: 'Análise da carga tributária, recuperação de créditos, defesas fiscais e estratégias legais de redução de impostos.', 
    price: 'R$ 650,00', 
    images: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800'
    ],
    online: true,
    presencial: true,
    code: 'TRIB001'
  },
  { 
    id: 7, 
    category: 'Direito do Consumidor', 
    name: 'Ações Consumeristas', 
    desc: 'Defesa dos direitos do consumidor em casos de vícios de produtos, práticas abusivas, cobranças indevidas e rescisão de contratos.', 
    price: 'R$ 320,00', 
    images: [
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800'
    ],
    online: true,
    presencial: false,
    code: 'CONS001'
  },
  { 
    id: 8, 
    category: 'Direito Imobiliário', 
    name: 'Regularização de Imóveis', 
    desc: 'Usucapião, inventário, partilha, elaboração de contratos de compra e venda, locação e assessoria em negócios imobiliários.', 
    price: 'Consulte', 
    images: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'
    ],
    online: false,
    presencial: true,
    code: 'IMO001'
  }
];

const DEFAULT_CATEGORIES = [
  'Direito Civil', 
  'Direito Trabalhista', 
  'Direito Previdenciário', 
  'Direito Empresarial', 
  'Direito de Família', 
  'Direito Tributário', 
  'Direito do Consumidor',
  'Direito Imobiliário'
];

const DEFAULT_STAFF: Staff[] = [
  { fullName: 'Dra. Maria Oliveira', firstName: 'Maria', login: 'maria', area: 'Civil' },
  { fullName: 'Dr. João Mendes', firstName: 'João', login: 'joao', area: 'Trabalhista' }
];

export default function PortfolioPage() {
  // --- State ---
  const [dataLoaded, setDataLoaded] = useState(false);
  const [appData, setAppData] = useState({
    services: DEFAULT_SERVICES,
    categories: DEFAULT_CATEGORIES,
    staff: DEFAULT_STAFF
  });
  
  const services = appData.services;
  const categories = appData.categories;
  const staff = appData.staff;

  const setServices = (newServices: Service[] | ((prev: Service[]) => Service[])) => {
    setAppData(prev => ({
      ...prev,
      services: typeof newServices === 'function' ? newServices(prev.services) : newServices
    }));
  };

  const setCategories = (newCats: string[] | ((prev: string[]) => string[])) => {
    setAppData(prev => ({
      ...prev,
      categories: typeof newCats === 'function' ? newCats(prev.categories) : newCats
    }));
  };

  const setStaff = (newStaff: Staff[] | ((prev: Staff[]) => Staff[])) => {
    setAppData(prev => ({
      ...prev,
      staff: typeof newStaff === 'function' ? newStaff(prev.staff) : newStaff
    }));
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [currentFilter, setCurrentFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Admin Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editServiceId, setEditServiceId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCat, setFormCat] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOnline, setFormOnline] = useState(true);
  const [formPresencial, setFormPresencial] = useState(true);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [uploadTab, setUploadTab] = useState<'file' | 'link'>('file');
  const [imageLinkInput, setImageLinkInput] = useState('');
  const [staffNameInput, setStaffNameInput] = useState('');
  const [staffAreaInput, setStaffAreaInput] = useState('');
  const [newCatInput, setNewCatInput] = useState('');

  // Modals State
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<Service | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleServiceId, setScheduleServiceId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [attendanceType, setAttendanceType] = useState<'online' | 'presencial' | ''>('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Toast State
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  const fetchData = useCallback(async () => {
    if (!supabase.from) {
      console.warn('Supabase not initialized');
      setDataLoaded(true);
      return;
    }
    try {
      const [
        { data: servicesData, error: servicesError },
        { data: categoriesData, error: categoriesError },
        { data: staffData, error: staffError }
      ] = await Promise.all([
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('staff').select('*').order('full_name')
      ]);

      if (servicesError) throw servicesError;
      if (categoriesError) throw categoriesError;
      if (staffError) throw staffError;

      const loadedData = {
        services: (servicesData && servicesData.length > 0) ? servicesData.map((s: any) => ({
          ...s,
          desc: s.description, // mapping description to desc to match interface
          createdAt: s.created_at
        })) : DEFAULT_SERVICES,
        categories: (categoriesData && categoriesData.length > 0) ? categoriesData.map((c: any) => c.name) : DEFAULT_CATEGORIES,
        staff: (staffData && staffData.length > 0) ? staffData.map((s: any) => ({
          fullName: s.full_name,
          firstName: s.first_name,
          login: s.login,
          area: s.area
        })) : DEFAULT_STAFF
      };

      setAppData(loadedData);
      setDataLoaded(true);

      // Check URL hash for service
      const hash = window.location.hash;
      if (hash.includes('servico=')) {
        const id = parseInt(hash.split('servico=')[1]);
        if (id) {
          const s = loadedData.services.find((x: Service) => x.id === id);
          if (s) {
            setSelectedServiceForModal(s);
            setShowServiceModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      showToast('Erro', 'Não foi possível carregar os dados do servidor.', 'error');
      // Fallback to defaults if Supabase fails
      setDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isAdmin) {
      setTimeout(() => {
        document.getElementById('admin-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isAdmin]);

  // --- Handlers ---
  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let auth = false;
    let userDisplayName = "";

    if (loginUser.toLowerCase() === MASTER_CRED.user && loginPass === MASTER_CRED.pass) {
      auth = true;
      userDisplayName = "Administrador";
    } else {
      const s = staff.find(x => x.login === loginUser.toLowerCase() && loginPass === STAFF_PASS);
      if (s) {
        auth = true;
        userDisplayName = s.firstName;
      }
    }

    if (auth) {
      setCurrentUser(userDisplayName);
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginUser("");
      setLoginPass("");
      showToast('Bem-vindo!', `Login realizado como ${userDisplayName}`);
    } else {
      showToast('Acesso Negado', 'Usuário ou senha incorretos', 'error');
    }
  };

  const handleLoginClick = () => {
    if (isAdmin) {
      document.getElementById('admin-panel')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser("");
    showToast('Logout', 'Você saiu do painel administrativo');
  };

  const handleAddStaff = async () => {
    if (!staffNameInput || !staffAreaInput) {
      showToast('Erro', 'Preencha nome e área de atuação', 'error');
      return;
    }
    const firstName = staffNameInput.split(' ')[0];
    const login = firstName.toLowerCase();
    if (staff.find(s => s.login === login)) {
      showToast('Erro', 'Advogado já cadastrado', 'error');
      return;
    }

    const newStaffMember = { fullName: staffNameInput, firstName, login, area: staffAreaInput };
    
    if (!supabase.from) {
      showToast('Erro', 'Supabase não configurado', 'error');
      return;
    }

    const { error } = await supabase.from('staff').insert([{
      full_name: staffNameInput,
      first_name: firstName,
      login: login,
      area: staffAreaInput
    }]);
    if (error) {
      showToast('Erro', 'Erro ao salvar no Supabase', 'error');
      return;
    }

    setStaff([...staff, newStaffMember]);
    setStaffNameInput('');
    setStaffAreaInput('');
    showToast('Sucesso', 'Advogado cadastrado!');
  };

  const handleAddCategory = async () => {
    if (!newCatInput) return;
    if (categories.includes(newCatInput)) {
      showToast('Erro', 'Área já existe', 'error');
      return;
    }

    if (!supabase.from) {
      showToast('Erro', 'Supabase não configurado', 'error');
      return;
    }

    const { error } = await supabase.from('categories').insert([{ name: newCatInput }]);
    if (error) {
      showToast('Erro', 'Erro ao salvar no Supabase', 'error');
      return;
    }

    setCategories([...categories, newCatInput]);
    setNewCatInput('');
    showToast('Sucesso', 'Área adicionada!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formImages.length + files.length > 4) {
      showToast('Erro', 'Máximo de 4 imagens permitido', 'error');
      return;
    }
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Erro', `Imagem ${file.name} deve ter menos de 2MB`, 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormImages(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageLink = () => {
    if (!imageLinkInput) return;
    if (formImages.length >= 4) {
      showToast('Erro', 'Máximo de 4 imagens permitido', 'error');
      return;
    }
    const img = new (window as any).Image();
    img.onload = () => {
      setFormImages(prev => [...prev, imageLinkInput]);
      setImageLinkInput('');
      showToast('Sucesso', 'Imagem adicionada via link');
    };
    img.onerror = () => {
      showToast('Erro', 'Link inválido ou imagem não encontrada', 'error');
    };
    img.src = imageLinkInput;
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCat) {
      showToast('Erro', 'Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const images = formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'];

    if (!supabase.from) {
      showToast('Erro', 'Supabase não configurado', 'error');
      return;
    }

    if (isEditing && editServiceId !== null) {
      const updatedService = {
        name: formName,
        price: formPrice || 'Consulte',
        category: formCat,
        description: formDesc || 'Serviço disponível para agendamento.',
        images,
        online: formOnline,
        presencial: formPresencial
      };

      const { error } = await supabase.from('services').update(updatedService).eq('id', editServiceId);
      if (error) {
        showToast('Erro', 'Erro ao atualizar no Supabase', 'error');
        return;
      }

      setServices(prev => prev.map(s => s.id === editServiceId ? {
        ...s,
        ...updatedService,
        desc: updatedService.description
      } : s));
      showToast('Serviço Atualizado!', `${formName} foi atualizado com sucesso.`);
    } else {
      const newServiceData = {
        code: `SRV${String(services.length + 1).padStart(3, '0')}`,
        name: formName,
        price: formPrice || 'Consulte',
        category: formCat,
        description: formDesc || 'Serviço disponível para agendamento.',
        images,
        online: formOnline,
        presencial: formPresencial
      };

      const { data, error } = await supabase.from('services').insert([newServiceData]).select();
      if (error) {
        showToast('Erro', 'Erro ao salvar no Supabase', 'error');
        return;
      }

      if (data && data[0]) {
        const newService = {
          ...data[0],
          desc: data[0].description
        };
        setServices(prev => [newService, ...prev]);
        showToast('Serviço Adicionado!', `${formName} foi cadastrado com sucesso.`);
      }
    }
    clearForm();
  };

  const clearForm = () => {
    setIsEditing(false);
    setEditServiceId(null);
    setFormName('');
    setFormPrice('');
    setFormCat('');
    setFormDesc('');
    setFormOnline(true);
    setFormPresencial(true);
    setFormImages([]);
    setUploadTab('file');
  };

  const handleEditService = (s: Service) => {
    setIsEditing(true);
    setEditServiceId(s.id);
    setFormName(s.name);
    setFormPrice(s.price);
    setFormCat(s.category);
    setFormDesc(s.desc);
    setFormOnline(s.online);
    setFormPresencial(s.presencial);
    setFormImages(s.images);
    document.getElementById('admin-panel')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    
    if (!supabase.from) {
      showToast('Erro', 'Supabase não configurado', 'error');
      return;
    }

    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      showToast('Erro', 'Erro ao excluir no Supabase', 'error');
      return;
    }

    setServices(prev => prev.filter(s => s.id !== id));
    showToast('Serviço Excluído', 'Item removido do catálogo');
  };

  const handleShare = (s: Service) => {
    const serviceLink = `${window.location.origin}${window.location.pathname}#servico=${s.id}`;
    const message = `*${s.name}*\n\n` +
      `🖼️ ${s.images[0]}\n\n` +
      `⚖️ *Área:* ${s.category}\n` +
      `💰 *Investimento:* ${s.price}\n` +
      `📝 *Descrição:* ${s.desc || 'Entre em contato para mais detalhes'}\n` +
      `📍 *Atendimento:* ${s.online ? '✅ Online' : ''} ${s.presencial ? '✅ Presencial' : ''}\n\n` +
      `🔗 *Ver no site:* ${serviceLink}\n\n` +
      `Agende sua consulta na *${ESCRITORIO_NOME}*!\n` +
      `📞 ${WHATSAPP_NUMBER_FORMAT}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleConfirmSchedule = async () => {
    if (!clientName || !clientPhone || !scheduleServiceId || !attendanceType || !appointmentDate || !selectedTime) {
      showToast('Campos obrigatórios', 'Preencha todos os campos marcados com *', 'error');
      return;
    }
    const service = services.find(s => s.id === parseInt(scheduleServiceId));
    if (!service) return;

    // Salvar no Supabase (Opcional, mas recomendado)
    if (supabase.from) {
      await supabase.from('appointments').insert([{
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
        service_id: parseInt(scheduleServiceId),
        service_name: service.name,
        attendance_type: attendanceType,
        appointment_date: appointmentDate,
        appointment_time: selectedTime,
        notes: appointmentNotes
      }]);
    }

    let message = `*📅 NOVO AGENDAMENTO - ${ESCRITORIO_NOME}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `👤 *Nome:* ${clientName}\n`;
    message += `📱 *WhatsApp:* ${clientPhone}\n`;
    if (clientEmail) message += `📧 *E-mail:* ${clientEmail}\n\n`;
    message += `⚖️ *Serviço:* ${service.name}\n`;
    message += `📂 *Área:* ${service.category}\n`;
    message += `💰 *Investimento:* ${service.price}\n\n`;
    message += `📍 *Modalidade:* ${attendanceType === 'online' ? '📹 Online' : '🏢 Presencial'}\n`;
    message += `📅 *Data:* ${appointmentDate.split('-').reverse().join('/')}\n`;
    message += `⏰ *Horário:* ${selectedTime}\n\n`;
    if (appointmentNotes) message += `📝 *Observações:* ${appointmentNotes}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Aguardo confirmação do agendamento.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    showToast('Redirecionando...', 'Abrindo WhatsApp para confirmar agendamento');
    setShowScheduleModal(false);
  };

  const filteredServices = services.filter(s => {
    const matchesFilter = currentFilter === 'Todos' || s.category === currentFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && (
        <div className="toast z-[100]">
          <div className={`bg-zinc-800 border ${toast.type === 'success' ? 'border-secondary/50' : 'border-red-500/50'} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up`}>
            <i className={`fas ${toast.type === 'success' ? 'fa-check-circle text-secondary' : 'fa-exclamation-circle text-red-500'} text-xl`}></i>
            <div>
              <p className="font-bold text-sm">{toast.title}</p>
              <p className="text-xs text-zinc-400">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="hero-gradient min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-darkness/50 to-darkness"></div>
        <div className="relative z-10 max-w-4xl mx-auto animate-slide-up w-full">
          <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/50 text-secondary text-xs font-black px-4 py-2 rounded-full mb-6 animate-bounce-soft uppercase tracking-widest">
            <i className="fas fa-balance-scale"></i> Excelência Jurídica desde 2010
          </div>
          <h1 className="hero-title font-black text-white mb-4 select-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary to-white">Oliveira Mendes</span>
            <span className="block text-3xl md:text-5xl font-serif italic mt-2 text-zinc-300">Advocacia & Consultoria</span>
          </h1>
          <p className="mt-6 text-zinc-300 max-w-2xl mx-auto font-medium text-base md:text-lg leading-relaxed px-4">
            Soluções jurídicas personalizadas com ética, transparência e resultados. 
            Especialistas em Direito Civil, Trabalhista, Empresarial e Previdenciário.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#catalogo" className="btn-primary text-white font-black px-8 md:px-12 py-4 md:py-5 rounded-2xl shadow-2xl uppercase flex items-center gap-2 md:gap-3 text-base md:text-lg">
              <i className="fas fa-gavel text-xl md:text-2xl"></i> Nossos Serviços
            </a>
            <button onClick={() => setShowScheduleModal(true)} className="glass-panel hover:bg-white/20 text-white font-black px-8 md:px-12 py-4 md:py-5 rounded-2xl border border-white/20 transition-all uppercase text-base md:text-lg backdrop-blur-md">
              <i className="fas fa-calendar-check mr-2"></i> Agendar Consulta
            </button>
          </div>
          <div className="mt-12 flex justify-center gap-8 text-zinc-400 text-sm">
            <div className="flex items-center gap-2"><i className="fas fa-map-marker-alt text-secondary"></i><span>Santo André/SP</span></div>
            <div className="flex items-center gap-2"><i className="fas fa-phone text-secondary"></i><span>(11) 94158-2643</span></div>
            <div className="flex items-center gap-2"><i className="fas fa-envelope text-secondary"></i><span>contato@oliveiram.com.br</span></div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-zinc-500">
          <i className="fas fa-chevron-down text-2xl"></i>
        </div>
      </section>

      {/* Admin Panel */}
      {isAdmin && (
        <section id="admin-panel" className="bg-zinc-900/95 border-y border-secondary/30 p-6 backdrop-blur-xl">
          <div className="container mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <i className="fas fa-cog text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-secondary font-black uppercase italic text-2xl">Olá, {currentUser}!</h2>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Gerenciamento de Serviços</p>
                </div>
              </div>
              <button onClick={handleLogout} className="bg-zinc-800 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold uppercase transition-all flex items-center gap-2">
                <i className="fas fa-sign-out-alt"></i> Sair
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Colaboradores */}
              <div className="lg:col-span-3 glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 text-zinc-400">
                  <i className="fas fa-users"></i>
                  <p className="text-xs font-bold uppercase">Advogados</p>
                </div>
                <div className="space-y-3">
                  <input type="text" value={staffNameInput} onChange={e => setStaffNameInput(e.target.value)} placeholder="Nome completo" className="input-field w-full p-3 rounded-lg text-sm text-white placeholder-zinc-600" />
                  <select value={staffAreaInput} onChange={e => setStaffAreaInput(e.target.value)} className="input-field w-full p-3 rounded-lg text-sm text-white bg-zinc-900">
                    <option value="">Área de atuação</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={handleAddStaff} className="w-full btn-primary text-white py-3 rounded-lg font-bold text-sm uppercase flex items-center justify-center gap-2">
                    <i className="fas fa-plus"></i> Cadastrar Advogado
                  </button>
                </div>
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {staff.map(s => (
                    <div key={s.login} className="bg-zinc-900/80 p-3 rounded-lg flex justify-between items-center border border-zinc-800">
                      <div>
                        <span className="text-sm font-bold text-white block">{s.fullName}</span>
                        <span className="text-xs text-zinc-500">{s.area}</span>
                      </div>
                      <button onClick={() => setStaff(staff.filter(x => x.login !== s.login))} className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Áreas de Atuação */}
              <div className="lg:col-span-3 glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 text-zinc-400">
                  <i className="fas fa-balance-scale"></i>
                  <p className="text-xs font-bold uppercase">Áreas de Atuação</p>
                </div>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={newCatInput} onChange={e => setNewCatInput(e.target.value)} placeholder="Nova área..." className="input-field flex-1 p-3 rounded-lg text-sm text-white placeholder-zinc-600" />
                  <button onClick={handleAddCategory} className="bg-secondary text-black px-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
                  {categories.map(c => (
                    <span key={c} className="bg-zinc-900 border border-zinc-700 text-sm px-3 py-2 rounded-lg flex items-center gap-2 text-zinc-300">
                      {c}
                      <button onClick={() => setCategories(categories.filter(x => x !== c))} className="text-zinc-600 hover:text-red-500 transition-colors">
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Form Serviço */}
              <div className="lg:col-span-6 glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-6 text-zinc-400">
                  <i className="fas fa-briefcase"></i>
                  <p className="text-xs font-bold uppercase">{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</p>
                </div>
                <form onSubmit={handleSaveService} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nome do Serviço *" className="input-field w-full p-4 rounded-lg text-white placeholder-zinc-600 font-medium" required />
                    </div>
                    <div>
                      <input type="text" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="Valor da Consulta (R$)" className="input-field w-full p-4 rounded-lg text-white placeholder-zinc-600" />
                    </div>
                    <div>
                      <select value={formCat} onChange={e => setFormCat(e.target.value)} className="input-field w-full p-4 rounded-lg text-white bg-zinc-900" required>
                        <option value="">Selecione a Área *</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Descrição detalhada do serviço..." rows={3} className="input-field w-full p-4 rounded-lg text-white placeholder-zinc-600 resize-none"></textarea>
                    </div>
                    <div className="col-span-2">
                      <label className="font-bold text-xs text-zinc-500 uppercase mb-2 block">Tipo de Atendimento Disponível</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={formOnline} onChange={e => setFormOnline(e.target.checked)} className="w-4 h-4 rounded border-zinc-600 text-secondary focus:ring-secondary bg-zinc-800" />
                          <span className="text-sm text-zinc-300"><i className="fas fa-video mr-1"></i> Online</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={formPresencial} onChange={e => setFormPresencial(e.target.checked)} className="w-4 h-4 rounded border-zinc-600 text-secondary focus:ring-secondary bg-zinc-800" />
                          <span className="text-sm text-zinc-300"><i className="fas fa-building mr-1"></i> Presencial</span>
                        </label>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="font-bold text-xs text-zinc-500 uppercase mb-2 block">Imagens do Serviço (até 4)</label>
                      <div className="upload-tabs">
                        <button type="button" className={`upload-tab ${uploadTab === 'file' ? 'active' : ''}`} onClick={() => setUploadTab('file')}><i className="fas fa-upload mr-2"></i>Upload</button>
                        <button type="button" className={`upload-tab ${uploadTab === 'link' ? 'active' : ''}`} onClick={() => setUploadTab('link')}><i className="fas fa-link mr-2"></i>Links</button>
                      </div>
                      {uploadTab === 'file' ? (
                        <div className="file-upload-container active">
                          <div className="image-upload-zone rounded-lg p-4 text-center relative" onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" multiple />
                            <div className={formImages.length > 0 ? 'hidden' : ''}>
                              <i className="fas fa-cloud-upload-alt text-3xl text-secondary mb-2"></i>
                              <p className="text-sm text-zinc-400">Clique para selecionar imagens</p>
                            </div>
                            <div className={`multi-upload-preview ${formImages.length === 0 ? 'hidden' : ''}`}>
                              {formImages.map((img, i) => (
                                <div key={i} className="preview-item">
                                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                                  <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); setFormImages(formImages.filter((_, idx) => idx !== i)); }}><i className="fas fa-times"></i></button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-zinc-600 mt-2 text-center">Máximo 4 imagens (JPG, PNG, WEBP)</p>
                        </div>
                      ) : (
                        <div className="link-input-container active">
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input type="url" value={imageLinkInput} onChange={e => setImageLinkInput(e.target.value)} placeholder="Cole o link da imagem aqui..." className="input-field flex-1 p-3 rounded-lg text-sm text-white placeholder-zinc-600" />
                              <button type="button" onClick={handleAddImageLink} className="bg-secondary text-black px-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors"><i className="fas fa-plus"></i></button>
                            </div>
                            <div className="multi-upload-preview">
                              {formImages.map((img, i) => (
                                <div key={i} className="preview-item">
                                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                                  <button type="button" className="remove-btn" onClick={() => setFormImages(formImages.filter((_, idx) => idx !== i))}><i className="fas fa-times"></i></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 flex gap-3">
                      <button type="button" onClick={clearForm} className="flex-1 bg-zinc-800 text-white py-4 rounded-lg font-bold uppercase text-sm hover:bg-zinc-700 transition-colors">Limpar</button>
                      <button type="submit" className="flex-[2] btn-primary text-white py-4 rounded-lg font-black uppercase text-sm flex items-center justify-center gap-2"><i className="fas fa-save"></i> {isEditing ? 'Atualizar Serviço' : 'Salvar Serviço'}</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Lista de Serviços Admin */}
            <div className="mt-8 glass-panel p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold uppercase text-zinc-400">Serviços Cadastrados</p>
                <span className="bg-secondary text-black text-xs px-3 py-1 rounded-full font-bold">{services.length} itens</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto no-scrollbar p-2">
                {services.map(s => (
                  <div key={s.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex gap-3 items-center group hover:border-secondary/50 transition-all">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      <Image src={s.images[0]} fill className="object-cover" alt="" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{s.name}</p>
                      <p className="text-xs text-zinc-500">{s.category}</p>
                      <p className="text-secondary font-black text-sm">{s.price}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleEditService(s)} className="text-blue-500 p-2 hover:bg-blue-500/10 rounded-lg transition-colors"><i className="fas fa-edit"></i></button>
                      <button onClick={() => handleDeleteService(s.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Catálogo */}
      <div id="catalogo" className="min-h-screen bg-gradient-to-b from-darkness to-zinc-900">
        <header className="sticky top-0 z-40 bg-darkness/95 backdrop-blur-xl border-b border-zinc-800 shadow-2xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <i className="fas fa-balance-scale text-white"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-black italic tracking-tighter text-white">Oliveira <span className="text-secondary">Mendes</span></h1>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Advocacia & Consultoria</p>
                </div>
              </div>
              <button onClick={handleLoginClick} className="text-zinc-600 hover:text-secondary transition-colors p-2 rounded-lg hover:bg-zinc-800">
                <i className="fas fa-user-shield text-xl"></i>
              </button>
            </div>
            <div className="relative mb-4">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por serviço, área ou descrição..." className="w-full bg-zinc-900/80 border border-zinc-800 p-4 pl-12 rounded-xl text-white outline-none focus:border-secondary transition-all shadow-inner text-sm" />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"><i className="fas fa-times-circle"></i></button>}
            </div>
            <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {['Todos', ...categories].map(cat => (
                <button key={cat} onClick={() => setCurrentFilter(cat)} className={`category-pill ${currentFilter === cat ? 'active' : 'bg-zinc-800 text-zinc-400'} px-6 py-3 rounded-xl whitespace-nowrap font-bold text-sm border border-transparent hover:border-secondary/30`}>
                  {cat.replace('Direito ', '')}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map(s => (
              <div key={s.id} className="service-card bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden group relative">
                {isAdmin ? (
                  <div className="quick-actions">
                    <button onClick={() => handleEditService(s)} className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"><i className="fas fa-edit text-xs"></i></button>
                    <button onClick={() => handleDeleteService(s.id)} className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"><i className="fas fa-trash text-xs"></i></button>
                  </div>
                ) : (
                  <button onClick={() => handleShare(s)} className="share-btn"><i className="fab fa-whatsapp"></i></button>
                )}
                <div className="badge-area">
                  <span className="bg-primary/80 text-white text-[10px] font-black px-3 py-1 rounded-full border border-secondary/30 uppercase tracking-wider backdrop-blur-sm">{s.category.replace('Direito ', '')}</span>
                </div>
                <div className="relative h-56 bg-zinc-800 overflow-hidden group-hover:shadow-inner cursor-pointer" onClick={() => { setSelectedServiceForModal(s); setShowServiceModal(true); setCurrentSlide(0); window.location.hash = `servico=${s.id}`; }}>
                  <Image src={s.images[0]} fill className="object-cover group-hover:scale-110 transition-transform duration-700" alt={s.name} unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60"></div>
                  {s.images.length > 1 && <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1"><i className="fas fa-images"></i> {s.images.length}</div>}
                </div>
                <div className="p-5 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{s.code || 'SERV'}</span>
                    <div className="flex gap-1">
                      {s.online && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded" title="Online"><i className="fas fa-video"></i></span>}
                      {s.presencial && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded" title="Presencial"><i className="fas fa-building"></i></span>}
                    </div>
                  </div>
                  <h3 className="font-serif font-black text-lg text-white mb-2 uppercase tracking-tight leading-tight min-h-[3.5rem] cursor-pointer hover:text-secondary transition-colors" onClick={() => { setSelectedServiceForModal(s); setShowServiceModal(true); setCurrentSlide(0); window.location.hash = `servico=${s.id}`; }}>{s.name}</h3>
                  <p className="text-zinc-500 text-xs mb-4 line-clamp-2 leading-relaxed">{s.desc}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                    <div>
                      <span className="text-xs text-zinc-600 block mb-1">Investimento</span>
                      <span className="text-xl font-black text-white">{s.price}</span>
                    </div>
                    <button onClick={() => { setScheduleServiceId(s.id.toString()); setShowScheduleModal(true); setAttendanceType(''); setSelectedTime(''); }} className="bg-secondary text-black hover:bg-yellow-400 px-6 py-3 rounded-xl font-bold text-xs uppercase transition-all transform active:scale-95 flex items-center gap-2 shadow-lg">
                      <i className="fas fa-calendar-plus"></i> Agendar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredServices.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4"><i className="fas fa-search text-4xl text-zinc-600"></i></div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum serviço encontrado</h3>
              <p className="text-zinc-500">Tente buscar com outros termos</p>
            </div>
          )}
        </main>
      </div>

      {/* WhatsApp Float */}
      <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Gostaria de mais informações sobre os serviços jurídicos da ${ESCRITORIO_NOME}.`)}`, '_blank')} className="fixed bottom-24 right-6 bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl z-40 hover:scale-110 transition-transform animate-bounce-soft border-4 border-darkness">
        <i className="fab fa-whatsapp"></i>
      </button>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setShowLoginModal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-shield text-white text-2xl"></i>
              </div>
              <h2 className="text-xl font-serif font-black italic text-secondary uppercase">Acesso Restrito</h2>
              <p className="text-xs text-zinc-500 font-bold uppercase mt-1">Identifique-se para continuar</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input 
                type="text" 
                value={loginUser} 
                onChange={e => setLoginUser(e.target.value)} 
                placeholder="Usuário" 
                className="input-field w-full p-4 rounded-xl text-white placeholder-zinc-600" 
                required 
                autoFocus
              />
              <input 
                type="password" 
                value={loginPass} 
                onChange={e => setLoginPass(e.target.value)} 
                placeholder="Senha" 
                className="input-field w-full p-4 rounded-xl text-white placeholder-zinc-600" 
                required 
              />
              <button type="submit" className="w-full btn-primary text-white py-4 rounded-xl font-black uppercase text-sm shadow-lg transform active:scale-95 transition-all">
                Entrar no Painel
              </button>
              <button type="button" onClick={() => setShowLoginModal(false)} className="w-full text-zinc-500 hover:text-white text-xs font-bold uppercase py-2 transition-colors">
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && selectedServiceForModal && (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto flex items-start justify-center p-4" onClick={() => { setShowServiceModal(false); history.pushState("", document.title, window.location.pathname + window.location.search); }}>
          <div className="modal-container bg-zinc-900 rounded-3xl border border-zinc-700 shadow-2xl animate-slide-up w-full max-w-4xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-gradient-to-r from-zinc-900 to-zinc-800 shrink-0">
              <div>
                <h2 className="text-xl font-serif font-black italic text-secondary">{selectedServiceForModal.name}</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase mt-1">{selectedServiceForModal.category}</p>
              </div>
              <button onClick={() => { setShowServiceModal(false); history.pushState("", document.title, window.location.pathname + window.location.search); }} className="text-zinc-500 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="relative">
                <div className="carousel-container">
                  {selectedServiceForModal.images.map((img, i) => (
                    <div key={i} className={`carousel-slide ${i === currentSlide ? 'active' : ''}`}>
                      <Image src={img} fill className="object-contain" alt="" unoptimized />
                    </div>
                  ))}
                </div>
                <button className="carousel-nav carousel-prev" onClick={() => setCurrentSlide(prev => prev === 0 ? selectedServiceForModal.images.length - 1 : prev - 1)}><i className="fas fa-chevron-left"></i></button>
                <button className="carousel-nav carousel-next" onClick={() => setCurrentSlide(prev => prev === selectedServiceForModal.images.length - 1 ? 0 : prev + 1)}><i className="fas fa-chevron-right"></i></button>
                <div className="carousel-dots">
                  {selectedServiceForModal.images.map((_, i) => (
                    <div key={i} className={`carousel-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}></div>
                  ))}
                </div>
              </div>
              <div className="thumbnail-container">
                {selectedServiceForModal.images.map((img, i) => (
                  <div key={i} className={`thumbnail relative shrink-0 ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}>
                    <Image src={img} fill className="object-cover rounded-lg" alt="" unoptimized />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase font-bold">Investimento</span>
                    <p className="text-secondary font-mono text-lg">{selectedServiceForModal.price}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 uppercase font-bold block">Modalidades</span>
                    <div className="flex gap-2 mt-1">
                      {selectedServiceForModal.online && <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30"><i className="fas fa-video mr-1"></i> Online</span>}
                      {selectedServiceForModal.presencial && <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30"><i className="fas fa-building mr-1"></i> Presencial</span>}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-bold">Descrição</span>
                  <p className="text-zinc-300 mt-2 leading-relaxed">{selectedServiceForModal.desc}</p>
                </div>
                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                  <button onClick={() => { setShowServiceModal(false); setScheduleServiceId(selectedServiceForModal.id.toString()); setShowScheduleModal(true); setAttendanceType(''); setSelectedTime(''); }} className="flex-1 btn-primary text-white py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 shadow-lg transform active:scale-95 transition-all"><i className="fas fa-calendar-plus"></i> Agendar Consulta</button>
                  <button onClick={() => handleShare(selectedServiceForModal)} className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center transition-all flex-shrink-0"><i className="fab fa-whatsapp text-2xl"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto flex items-start justify-center p-4" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-container bg-zinc-900 rounded-3xl border border-zinc-700 shadow-2xl animate-slide-up w-full max-w-[600px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-gradient-to-r from-zinc-900 to-zinc-800 shrink-0">
              <div>
                <h2 className="text-xl font-serif font-black italic text-secondary">AGENDAR CONSULTA</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase mt-1">Escolha o serviço e horário</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-zinc-500 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <label className="font-bold text-xs text-zinc-500 uppercase">Seus Dados</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nome completo *" className="input-field w-full p-3 rounded-lg text-white placeholder-zinc-600" />
                <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="WhatsApp *" className="input-field w-full p-3 rounded-lg text-white placeholder-zinc-600" />
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="E-mail" className="input-field w-full p-3 rounded-lg text-white placeholder-zinc-600" />
              </div>
              <div className="space-y-3">
                <label className="font-bold text-xs text-zinc-500 uppercase">Serviço de Interesse</label>
                <select value={scheduleServiceId} onChange={e => { setScheduleServiceId(e.target.value); setAttendanceType(''); }} className="input-field w-full p-3 rounded-lg text-white bg-zinc-900">
                  <option value="">Selecione um serviço...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.category}</option>)}
                </select>
              </div>
              {scheduleServiceId && (
                <div className="space-y-3">
                  <label className="font-bold text-xs text-zinc-500 uppercase">Modalidade</label>
                  <div className="grid grid-cols-2 gap-3">
                    {services.find(s => s.id === parseInt(scheduleServiceId))?.online && (
                      <button type="button" onClick={() => setAttendanceType('online')} className={`attendance-btn p-3 rounded-lg text-center transition-all ${attendanceType === 'online' ? 'border-secondary bg-secondary/20' : 'bg-zinc-800 border border-zinc-700'}`}>
                        <i className={`fas fa-video text-2xl mb-2 ${attendanceType === 'online' ? 'text-secondary' : 'text-zinc-400'}`}></i>
                        <p className="text-sm font-bold text-zinc-300">Online</p>
                        <p className="text-xs text-zinc-500">Vídeo chamada</p>
                      </button>
                    )}
                    {services.find(s => s.id === parseInt(scheduleServiceId))?.presencial && (
                      <button type="button" onClick={() => setAttendanceType('presencial')} className={`attendance-btn p-3 rounded-lg text-center transition-all ${attendanceType === 'presencial' ? 'border-secondary bg-secondary/20' : 'bg-zinc-800 border border-zinc-700'}`}>
                        <i className={`fas fa-building text-2xl mb-2 ${attendanceType === 'presencial' ? 'text-secondary' : 'text-zinc-400'}`}></i>
                        <p className="text-sm font-bold text-zinc-300">Presencial</p>
                        <p className="text-xs text-zinc-500">No escritório</p>
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <label className="font-bold text-xs text-zinc-500 uppercase">Data Preferida</label>
                <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="date-input" />
              </div>
              {appointmentDate && attendanceType && (
                <div className="space-y-3">
                  <label className="font-bold text-xs text-zinc-500 uppercase">Horário Disponível</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map(h => (
                      <button key={h} type="button" onClick={() => setSelectedTime(h)} className={`time-slot py-2 rounded-lg text-sm font-bold transition-all border ${selectedTime === h ? 'selected' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-secondary'}`}>{h}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <label className="font-bold text-xs text-zinc-500 uppercase">Observações</label>
                <textarea value={appointmentNotes} onChange={e => setAppointmentNotes(e.target.value)} placeholder="Descreva brevemente sua situação..." rows={3} className="input-field w-full p-3 rounded-lg text-white placeholder-zinc-600 resize-none"></textarea>
              </div>
            </div>
            <div className="p-5 bg-zinc-950 border-t border-zinc-800 space-y-3 shrink-0">
              <div className="flex justify-between items-center border-t border-zinc-800 pt-3">
                <div>
                  <span className="text-sm text-zinc-400 block">Valor Estimado</span>
                  <span className="text-2xl font-black text-white">{scheduleServiceId ? services.find(s => s.id === parseInt(scheduleServiceId))?.price : 'Consulte'}</span>
                </div>
              </div>
              <button onClick={handleConfirmSchedule} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black flex justify-center items-center gap-2 transition-all uppercase shadow-lg hover:shadow-green-600/20">
                <i className="fab fa-whatsapp text-xl"></i> Confirmar via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

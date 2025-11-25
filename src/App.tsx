import React, { useState, useEffect } from 'react';
import { 
  Calendar, Check, ArrowRight, MessageCircle, Leaf, 
  MapPin, Smartphone, Ruler, Zap, ChevronRight, 
  AlertCircle, Star, Award, User, BookOpen, Clock, 
  ChevronLeft, PhoneCall, Mail, CreditCard, Wallet
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, addDoc, collection, onSnapshot
} from 'firebase/firestore';

// --- CONFIGURAÇÃO FIREBASE (CHAVE CORRIGIDA DO SEU TEXTO) ---
const firebaseConfig = {
  apiKey: "AIzaSyDtdnW6kAFEpKQnpP3iJuuxJCIk87M_lcc", // Chave corrigida
  authDomain: "vitta-7321a.firebaseapp.com",
  projectId: "vitta-7321a",
  storageBucket: "vitta-7321a.firebasestorage.app",
  messagingSenderId: "913465735646",
  appId: "1:913465735646:web:16c9bbe60927916689854f",
  measurementId: "G-HB82KJ4JK8"
};

const RESERVATION_COLLECTION = `reservations`;

// Variáveis globais
let db: any = null;
let auth: any = null;

// Inicialização Segura
if (typeof window !== 'undefined') { 
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase conectado.");
  } catch (e) {
    console.error("Erro ao conectar Firebase:", e);
  }
}

// --- CORES E DADOS ---
const BRAND = {
  PRIMARY: '#004D40',
  HIGHLIGHT: '#FFC107',
  TEXT: '#1F2937',
  BG: '#F9FAFB',
};

const PROF_BIO = {
  name: "PROF. VITOR FIECHTER", 
  role: "O PROFESSOR DO MOVIMENTO", 
  text: "Minha paixão pelo corpo humano me levou à Educação Física pela UFPR. Mas minha jornada analítica começou antes, como Técnico em Eletrônica. Não vejo apenas músculos, vejo sistemas complexos que precisam de lógica, precisão e didática.",
  experience: "5 anos de experiência | Formado pela UFPR"
};

const METHOD_PILLARS = [
  { title: "CIÊNCIA", desc: "Adeus aos mitos. Treino 100% baseado em evidências.", icon: <BookOpen className="w-5 h-5 text-white" /> },
  { title: "DIDÁTICA", desc: "Você não só executa, você entende. O objetivo é sua autonomia.", icon: <Award className="w-5 h-5 text-white" /> },
  { title: "MENTE", desc: "Transformar obrigação em prazer. A constância vence a autossabotagem.", icon: <Star className="w-5 h-5 text-white" /> }
];

const PLANS_DATA: any = {
  presencial: {
    label: "PRESENCIAL",
    icon: <MapPin className="w-6 h-6 text-white" />,
    plans: [
      { id: 'prog_balance', name: 'PROGRAMA BALANCE', price: 'R$ 789,90', period: 'MENSAL', tagline: 'Consistência inteligente', features: ['8 sessões mensais guiadas', 'Correção biomecânica em tempo real', 'Avaliação Física Deluxe inclusa', 'Periodização de treino personalizada', 'Suporte dúvidas via WhatsApp', 'Acesso ao Guia de Mobilidade'], frequency: 2, badge: 'AVALIAÇÃO DELUXE INCLUSA' },
      { id: 'prog_intensive', name: 'PROGRAMA INTENSIVE', price: 'R$ 1.049,90', period: 'MENSAL', tagline: 'Máxima performance', features: ['12 sessões mensais guiadas', 'Imersão total no método', 'Avaliação Física Deluxe inclusa', 'Periodização e ajustes semanais', 'Suporte prioritário WhatsApp', 'Guia de Mobilidade e Flexibilidade'], featured: true, highlight: 'DESTAQUE ELITE', frequency: 3, badge: 'DESTAQUE ELITE' }
    ]
  },
  online: {
    label: "ONLINE",
    icon: <Smartphone className="w-6 h-6 text-white" />,
    plans: [
      { id: 'on_start', name: 'START', price: 'R$ 129,90', period: 'MENSAL', tagline: 'Para começar certo', features: ['Avaliação e diagnóstico', 'Planejamento de aderência', 'Suporte via App'], frequency: 0 },
      { id: 'on_performance', name: 'PERFORMANCE', price: 'R$ 199,90', period: 'MENSAL', tagline: 'O suporte da IA Vitta+', features: ['Tudo do plano Start', 'Análise de vídeo (correção)', 'Ajustes de treino a cada 4 semanas', 'Dúvidas? Fale com a IA Vitta+', '1 videochamada mensal (didática)'], frequency: 0, highlight: 'SUPORTE RÁPIDO' },
      { id: 'on_elite', name: 'MENTORIA ELITE', price: 'R$ 349,90', period: 'MENSAL', tagline: 'Experiência completa', features: ['Suporte prioritário VIP', '4 videochamadas mensais (semanal)', 'Acompanhamento de perto', 'Didática aprofundada'], frequency: 0 }
    ]
  },
  avaliacao: {
    label: "AVALIAÇÃO",
    icon: <Ruler className="w-6 h-6 text-white" />,
    plans: [
      { id: 'av_premium', name: 'PREMIUM', price: 'R$ 149,90', period: 'SESSÃO ÚNICA', tagline: 'Diagnóstico essencial', features: ['Peso e altura', 'Circunferências', 'Anamnese completa', 'Postural (agachamento)'], frequency: 1 },
      { id: 'av_deluxe', name: 'DELUXE', price: 'R$ 249,90', period: 'SESSÃO ÚNICA', tagline: 'Análise 360º profunda', features: ['Tudo da Premium', 'VO2 Submáximo', 'Testes de força', 'Teste de encurtamento', 'Dobras cutâneas', 'Bioimpedância'], highlight: 'MAIS COMPLETA', frequency: 1 }
    ]
  },
  combos: { 
    label: "COMBOS",
    icon: <Zap className="w-6 h-6 text-white" />,
    plans: [
      { id: 'combo_hybrid', name: 'PERFORMANCE + DELUXE', price: 'R$ 389,90', period: 'COMBO', tagline: 'O melhor dos dois mundos', features: ['Consultoria online Performance', '1 Avaliação Deluxe presencial', 'Relatório integrado completo', 'Economia inteligente'], highlight: 'HÍBRIDO PERFEITO', frequency: 1 }
    ]
  }
};

const INITIAL_SLOTS_DATA = [
  { name: 'Segunda', morning: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'], afternoon: ['14:00', '15:00', '16:00', '17:00', '18:00'] },
  { name: 'Terça', morning: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'], afternoon: ['14:00', '15:00', '16:00', '17:00', '18:00'] },
  { name: 'Quarta', morning: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'], afternoon: ['14:00', '15:00', '16:00', '17:00', '18:00'] },
  { name: 'Quinta', morning: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'], afternoon: ['14:00', '15:00', '16:00', '17:00', '18:00'] },
  { name: 'Sexta', morning: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'], afternoon: ['14:00', '15:00', '16:00', '17:00', '18:00'] },
];

const createInitialSlotState = () => INITIAL_SLOTS_DATA.map(day => ({
  name: day.name,
  slots: [
    ...day.morning.map(time => ({ time, booked: false })),
    ...day.afternoon.map(time => ({ time, booked: false })),
  ],
}));

const PHONE_NUMBER = "5541995498077"; 
const EMAIL_CONTACT = "vitorfiechter@ufpr.br"; 

// --- APP PRINCIPAL ---

export default function App() {
  const [activeTab, setActiveTab] = useState('presencial');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]); 
  const [userData, setUserData] = useState({ name: '', payment: 'pix' });
  const [step, setStep] = useState(0); 
  const [errorMsg, setErrorMsg] = useState('');
  const [availableSlots, setAvailableSlots] = useState(createInitialSlotState()); 
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Sincronização segura
  useEffect(() => {
    if (!db) return;
    try {
      const unsubscribe = onSnapshot(collection(db, RESERVATION_COLLECTION), (snapshot) => {
        const allBookedSlots: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.slots && Array.isArray(data.slots)) allBookedSlots.push(...data.slots);
        });

        setAvailableSlots((currentSlots) => {
          return currentSlots.map((dayBlock) => ({
            ...dayBlock,
            slots: dayBlock.slots.map((slot) => {
              const isBooked = allBookedSlots.some(
                (booked) => booked.day === dayBlock.name && booked.time === slot.time
              );
              return { ...slot, booked: isBooked };
            }),
          }));
        });
      }, (e) => console.warn("Modo offline (leitura):", e));
      return () => unsubscribe();
    } catch (e) { console.warn("Erro no listener:", e); }
  }, []);

  // 2. Autenticação
  useEffect(() => {
    if (!auth) { setUserId('offline'); return; }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else signInAnonymously(auth).catch((e) => console.warn("Login anônimo falhou:", e));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setErrorMsg(''); }, [step]);
  useEffect(() => { setSelectedSlots([]); }, [selectedPlan]);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setStep(plan.frequency === 0 ? 3 : 2);
  };

  const handleSlotToggle = (dayName: string, time: string) => {
    setErrorMsg('');
    if (!selectedPlan) return;

    const maxSlots = selectedPlan.frequency;
    const slotId = `${dayName}-${time}`;
    const existingIndex = selectedSlots.findIndex(s => s.id === slotId);
    
    if (existingIndex >= 0) {
      const newSlots = [...selectedSlots];
      newSlots.splice(existingIndex, 1);
      setSelectedSlots(newSlots);
      return;
    }

    if (selectedSlots.length >= maxSlots) {
      setErrorMsg(`Selecione exatamente ${maxSlots} horário(s).`);
      return;
    }

    const hasSlotInDay = selectedSlots.some(s => s.day === dayName);
    if (hasSlotInDay && maxSlots > 1) {
      setErrorMsg("Escolha dias diferentes para cada treino.");
      return;
    }

    setSelectedSlots([...selectedSlots, { id: slotId, day: dayName, time }]);
  };

  const formatSelectedSlots = () => {
    if (selectedSlots.length === 0) return 'A definir';
    const dayOrder: any = { 'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5 };
    const sorted = [...selectedSlots].sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
    return sorted.map(s => `${s.day} às ${s.time}`).join('\n• ');
  };

  const handleFinalize = async () => {
    if (!userData.name) {
      setErrorMsg("Por favor, preencha seu nome para continuarmos.");
      return;
    }

    if (db) {
      try {
        await addDoc(collection(db, RESERVATION_COLLECTION), {
          userId: userId || 'anon',
          userName: userData.name,
          plan: selectedPlan.name,
          price: selectedPlan.price,
          paymentMethod: userData.payment,
          slots: selectedSlots,
          createdAt: new Date(),
        });
      } catch (e) { console.warn("Erro ao salvar no banco (seguindo para WhatsApp):", e); }
    }

    const paymentLabels: any = { 'pix': 'PIX', 'credito': 'Cartão de Crédito', 'debito': 'Cartão de Débito' };
    const scheduleText = selectedPlan.frequency === 0 ? 'Online' : formatSelectedSlots().replace(/\n/g, ', ');
    const message = `*OLÁ, PROF. VITOR!* 👋%0A%0A` +
      `Gostaria de solicitar a seguinte reserva no Vitta+:%0A%0A` +
      `👤 *ALUNO:* ${userData.name.toUpperCase()}%0A` +
      `🏷️ *SERVIÇO:* ${PLANS_DATA[activeTab].label} - ${selectedPlan.name}%0A` +
      `💰 *VALOR:* ${selectedPlan.price} (${selectedPlan.period})%0A` +
      `💳 *PAGAMENTO:* ${paymentLabels[userData.payment].toUpperCase()}%0A%0A` +
      `📅 *AGENDA SOLICITADA:* %0A   • ${scheduleText.replace(/, /g, '%0A   • ')}%0A%0A` +
      `_Aguardo confirmação!_`;

    window.open(`https://wa.me/${PHONE_NUMBER}?text=${message}`, '_blank');
    
    setTimeout(() => {
      setSelectedSlots([]);
      setSelectedPlan(null);
      setActiveTab('presencial');
      setUserData({ name: '', payment: 'pix' });
      setStep(0); 
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-800 antialiased pb-24 selection:bg-[#004D40] selection:text-white">
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(0)}>
            <Leaf className="w-5 h-5 text-[#004D40]" strokeWidth={2.5} />
            <span className="text-lg font-bold tracking-tight text-[#1F2937] uppercase">Vitta<span className="font-extrabold text-[#FFC107]">+</span></span>
          </div>
          {step > 0 && (
            <button onClick={() => {
              if (step === 2) { setSelectedPlan(null); setStep(1); }
              else if (step === 3 && selectedPlan?.frequency === 0) setStep(1);
              else setStep(step - 1);
            }} className="text-[10px] font-bold text-gray-400 hover:text-[#004D40] uppercase tracking-widest transition-colors flex items-center gap-1">
              <ChevronLeft size={12} /> Voltar
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-md mx-auto pt-20 px-6">
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 text-center mt-6 pb-10">
            <div className="w-24 h-24 rounded-full border-4 border-white p-1 mb-4 shadow-2xl shadow-gray-200 mx-auto bg-white">
              <div className="w-full h-full rounded-full flex items-center justify-center text-3xl font-light text-white bg-[#004D40]">VF</div>
            </div>
            <h1 className="text-3xl font-light mb-1 uppercase tracking-tight text-[#1F2937]">{PROF_BIO.name}</h1>
            <p className="text-xs font-bold uppercase tracking-widest mb-6 text-[#FFC107]">{PROF_BIO.role}</p>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 text-left mb-8 relative">
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-[#004D40]"></div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 pl-3 italic">"{PROF_BIO.text}"</p>
              <div className="ml-3 flex items-center gap-2 text-[10px] font-bold uppercase px-2 py-1 rounded w-fit text-white bg-[#004D40]"><User size={12} /> {PROF_BIO.experience}</div>
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-[#1F2937]">O Método: Pilares da Constância</h2>
            <div className="grid gap-3 text-left">
              {METHOD_PILLARS.map((pillar, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 shadow-sm hover:border-[#FFC107] transition-all cursor-default group">
                  <div className="p-2 rounded-lg h-fit flex items-center justify-center shrink-0 bg-[#004D40] group-hover:scale-110 transition-transform">{pillar.icon}</div>
                  <div><h3 className="text-xs font-bold uppercase mb-0.5 text-[#1F2937]">{pillar.title}</h3><p className="text-[10px] text-gray-500 leading-snug">{pillar.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-10 space-y-3">
              <button onClick={() => setStep(1)} className="w-full py-4 rounded-xl text-white font-bold tracking-wide shadow-2xl flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all text-xs uppercase bg-[#004D40] shadow-green-900/20 hover:bg-[#003d33]">Ver Planos e Agendar <ArrowRight size={16} className="text-[#FFC107]" /></button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-6"><h2 className="text-2xl font-light uppercase text-[#1F2937]">Serviços</h2><p className="text-xs text-gray-500">Escolha a categoria ideal.</p></div>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {Object.keys(PLANS_DATA).map((key) => (
                <div key={key} onClick={() => setActiveTab(key)} className={`bg-white rounded-xl p-4 border cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center text-center gap-2 h-28 ${activeTab === key ? `border-[#004D40] ring-1 ring-[#004D40] shadow-md` : 'border-gray-100 hover:border-gray-300 hover:shadow-md'}`} style={{ borderColor: activeTab === key ? BRAND.PRIMARY : undefined, boxShadow: activeTab === key ? `0 10px 15px -3px rgba(0, 77, 64, 0.1)` : undefined }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors duration-300`} style={{ backgroundColor: activeTab === key ? BRAND.PRIMARY : '#F3F4F6', color: activeTab === key ? 'white' : BRAND.PRIMARY }}>{React.cloneElement(PLANS_DATA[key].icon, { className: "w-5 h-5" })}</div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-800 leading-tight">{PLANS_DATA[key].label}</h3>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-bold uppercase mb-4 pt-4 border-t border-gray-100 text-[#1F2937] tracking-widest">{PLANS_DATA[activeTab].label}</h3>
            <div className="space-y-5 pb-10">
              {PLANS_DATA[activeTab].plans.map((plan: any) => (
                <div key={plan.id} onClick={() => handlePlanSelect(plan)} className={`group bg-white rounded-2xl p-6 border transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md ${plan.highlight ? 'border-[#FFC107]' : 'border-gray-100 hover:border-[#004D40]'}`}>
                  {(plan.highlight || plan.badge) && (<div className={`absolute top-0 right-0 text-[#1F2937] text-[8px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest bg-[#FFC107]`}>{plan.highlight || plan.badge || 'DESTAQUE'}</div>)}
                  <div className="flex justify-between items-start mb-3"><div className="text-right w-full"><p className="text-xl font-bold text-[#004D40]">{plan.price}</p><p className="text-[9px] text-gray-400 uppercase font-medium">{plan.period}</p></div></div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-[#1F2937]">{plan.name}</h3>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-4">{plan.tagline}</p>
                  {plan.features && (<div className="space-y-2 border-t border-gray-100 pt-3">{plan.features.map((feat: any, idx: number) => (<div key={idx} className="flex items-start text-xs text-gray-600"><Check className="w-3.5 h-3.5 mr-2 shrink-0 text-[#004D40]" />{feat}</div>))}</div>)}
                  <div className="mt-4 flex items-center justify-end text-xs font-bold text-[#FFC107] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">SELECIONAR <ChevronRight size={14} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedPlan && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 pb-24">
            <div className="sticky top-16 bg-[#F9FAFB]/95 py-4 z-30 backdrop-blur-sm border-b border-gray-100 mb-6">
              <h2 className="text-xl font-light uppercase text-[#1F2937]">Agendamento</h2>
              <div className="flex items-center justify-between mt-1"><span className="text-xs text-gray-500 uppercase font-medium">{selectedPlan.frequency === 1 ? 'Selecione 1 horário' : `Selecione ${selectedPlan.frequency} dias diferentes`}</span><span className={`text-lg font-bold`} style={{ color: selectedSlots.length === selectedPlan.frequency ? '#004D40' : '#FFC107' }}>{selectedSlots.length}/{selectedPlan.frequency}</span></div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3 mb-6"><Clock className="w-4 h-4 text-amber-600 shrink-0" /><p className="text-[10px] text-amber-900 leading-snug"><strong>ATENÇÃO:</strong> Horários em cinza estão <strong>reservados</strong>. A reserva é confirmada via WhatsApp.</p></div>
            {errorMsg && (<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 animate-pulse"><AlertCircle size={16} />{errorMsg}</div>)}
            <div className="space-y-6">
              {availableSlots.map((dayBlock, idx) => { 
                const hasSlotInDay = selectedSlots.some(s => s.day === dayBlock.name);
                const isDayLocked = hasSlotInDay && selectedPlan.frequency > 1 && selectedSlots.length < selectedPlan.frequency;
                const canSelectMore = selectedSlots.length < selectedPlan.frequency;
                return (
                  <div key={idx} className={`bg-white border rounded-2xl p-4 transition-all shadow-sm ${hasSlotInDay ? 'border-[#004D40] shadow-md' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-3"><span className="text-xs font-bold uppercase flex items-center gap-2 text-[#1F2937]"><Calendar size={14} className="text-[#004D40]" /> {dayBlock.name}</span></div>
                    <div className="grid grid-cols-4 gap-2">
                      {dayBlock.slots.map((slot) => {
                        const isSelected = selectedSlots.some(s => s.day === dayBlock.name && s.time === slot.time);
                        const isBooked = slot.booked; 
                        let isDisabled = isBooked;
                        if (!isSelected && isDayLocked) isDisabled = true;
                        if (!isSelected && !isDayLocked && !canSelectMore) isDisabled = true;
                        return (
                          <button key={slot.time} disabled={isDisabled} onClick={() => handleSlotToggle(dayBlock.name, slot.time)} className={`py-2 rounded-lg text-[10px] font-bold transition-all shadow-sm border ${isSelected ? 'bg-[#004D40] text-white border-[#004D40] shadow-lg scale-[1.02]' : isBooked ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent' : isDisabled ? 'bg-gray-50 text-gray-300 cursor-not-allowed border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:border-[#FFC107]'}`}>{slot.time}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-xl z-50">
              <button onClick={() => selectedSlots.length === selectedPlan.frequency && setStep(3)} disabled={selectedSlots.length !== selectedPlan.frequency} className={`w-full py-4 rounded-xl font-bold tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 uppercase text-xs text-white ${selectedSlots.length === selectedPlan.frequency ? 'bg-[#004D40] shadow-green-900/20 active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed shadow-none'} `}>CONFIRMAR E REVISAR <ArrowRight size={16} className="text-[#FFC107]" /></button>
            </div>
          </div>
        )}

        {step === 3 && selectedPlan && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 pt-4 pb-24">
            <div className="text-center mb-8"><h2 className="text-xl font-light uppercase text-[#1F2937]">Revisão</h2><p className="text-xs text-gray-500">Confirme seus dados para envio.</p></div>
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/70 border border-gray-100 overflow-hidden mb-8 relative">
              <div className="h-2 w-full bg-gradient-to-r from-[#004D40] via-[#FFC107] to-[#FFC107] opacity-80"></div>
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start border-b border-gray-100 pb-4"><div><span className="text-[9px] uppercase tracking-wider text-gray-400 mb-1 block">Serviço Selecionado</span><h3 className="text-lg font-bold uppercase tracking-tight text-[#1F2937]">{selectedPlan.name}</h3><span className="text-[9px] text-white px-2 py-0.5 rounded-full uppercase font-bold bg-[#004D40]">{PLANS_DATA[activeTab].label}</span></div><div className="text-right"><span className="text-2xl font-bold block text-[#004D40]">{selectedPlan.price}</span><span className="text-[9px] text-gray-400 uppercase">{selectedPlan.period}</span></div></div>
                {selectedPlan.frequency > 0 ? (<div className="border-b border-gray-100 pb-4"><span className="text-[9px] uppercase tracking-wider text-gray-400 mb-2 block">Agenda</span><div className="text-xs text-[#1F2937] bg-gray-50 p-3 rounded-lg border border-gray-100 font-medium"><div className="flex items-center gap-2 mb-1 text-[#004D40]"><Clock size={14} /><span>Agendamento Solicitado:</span></div><pre className="whitespace-pre-wrap text-[11px] mt-2 leading-relaxed font-semibold">{formatSelectedSlots()}</pre></div></div>) : (<div className="border-b border-gray-100 pb-4"><span className="text-[9px] uppercase tracking-wider text-gray-400 mb-2 block">Modalidade</span><div className="text-xs text-[#1F2937] bg-gray-50 p-3 rounded-lg border border-gray-100 font-medium flex items-center gap-2"><Smartphone size={14} className="text-[#004D40]" />Online - Suporte e treino via App.</div></div>)}
                <div className="pt-4 border-t border-gray-100"><label htmlFor="userName" className="text-[9px] uppercase tracking-wider text-gray-400 mb-2 block">Seu Nome Completo</label><input id="userName" type="text" value={userData.name} onChange={(e) => { setUserData({ ...userData, name: e.target.value }); setErrorMsg(''); }} placeholder="Ex: João da Silva" className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-[#004D40] focus:ring-1 focus:ring-[#004D40] outline-none transition-colors" /></div>
                <div className="pt-4 border-t border-gray-100"><span className="text-[9px] uppercase tracking-wider text-gray-400 mb-2 block">Forma de Pagamento Preferida</span><div className="grid grid-cols-3 gap-3">{['pix', 'credito', 'debito'].map((method) => (<label key={method} className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${userData.payment === method ? 'bg-[#004D40] border-[#004D40] text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-[#FFC107]'}`}><input type="radio" name="paymentMethod" value={method} checked={userData.payment === method} onChange={() => setUserData({ ...userData, payment: method })} className="sr-only" />{method === 'pix' && <Zap size={20} />}{method === 'credito' && <CreditCard size={20} />}{method === 'debito' && <Wallet size={20} />}<span className="text-[10px] font-bold mt-1 uppercase">{method === 'pix' ? 'PIX' : method === 'credito' ? 'CRÉDITO' : 'DÉBITO'}</span></label>))}</div></div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex gap-3 text-left"><MessageCircle className="w-4 h-4 text-[#004D40] shrink-0 mt-0.5" /><div><p className="text-[10px] text-[#004D40] font-bold leading-snug">Próximo Passo: Confirmação</p><p className="text-[10px] text-gray-700 leading-snug mt-1">Ao clicar em "Reservar", você será redirecionado para o WhatsApp do Prof. Vitor para finalizar o pagamento e confirmar seus horários.</p></div></div>
              </div>
            </div>
            {errorMsg && (<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 animate-pulse"><AlertCircle size={16} />{errorMsg}</div>)}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-xl z-50">
              <button onClick={handleFinalize} disabled={!userData.name} className={`w-full py-4 rounded-xl font-bold tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 uppercase text-xs text-white ${userData.name ? 'bg-[#FFC107] shadow-yellow-800/20 hover:bg-[#e0ad00] active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed shadow-none'} `}>ENVIAR RESERVA E IR PARA O WHATSAPP <ArrowRight size={16} className="text-[#004D40]" /></button>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-[#1F2937] text-white p-6 mt-16 shadow-inner">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-700 pb-4"><Leaf className="w-5 h-5 text-[#FFC107]" strokeWidth={2.5} /><span className="text-lg font-bold tracking-tight uppercase">Vitta<span className="font-extrabold text-[#FFC107]">+</span></span></div>
          <div className="space-y-3 pt-3"><div className="flex items-center gap-3 text-sm text-gray-300"><User size={16} className="text-[#FFC107] shrink-0" /><p className="font-bold">Prof. Vitor Fiechter</p></div><a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-3 text-sm text-gray-300 hover:text-[#FFC107] transition-colors"><PhoneCall size={16} className="text-[#004D40] shrink-0" /><p className="underline">(41) 9 9549 8077 (Concierge)</p></a><a href={`mailto:${EMAIL_CONTACT}`} className="flex items-center gap-3 text-sm text-gray-300 hover:text-[#FFC107] transition-colors"><Mail size={16} className="text-[#004D40] shrink-0" /><p className="underline">{EMAIL_CONTACT}</p></a><div className="text-xs text-gray-500 pt-4 border-t border-gray-700 mt-4"><p>O Vitta+ é uma consultoria de movimento focada em ciência e didática.</p><p className="mt-1">© 2024 Vitta+ Todos os direitos reservados.</p></div></div>
        </div>
      </footer>
    </div>
  );
}
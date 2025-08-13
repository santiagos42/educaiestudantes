import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot, collection, addDoc, query, deleteDoc, updateDoc, serverTimestamp, writeBatch, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ArrowRight, Bookmark, CheckCircle, XCircle, BarChart2, FileText, BookOpen, Sun, Moon, Sparkles, Home, Library, Atom, Zap, Target, BarChartHorizontal, PlusCircle, ChevronLeft, ChevronRight, Lightbulb, Loader, Trash2, Dna, FlaskConical, BrainCircuit, Stethoscope, Microscope, HeartPulse, Pill, Wand2, Cloud, Play, Edit, Clock, Inbox, Folder, FolderPlus, FolderInput, ChevronDown, Droplets, Feather, FolderSymlink, TrendingUp, RotateCw, AlertTriangle, Star } from 'lucide-react';

// --- CONFIGURAÇÃO DO FIREBASE (Lendo do .env.local) ---
let app, auth, db, firebaseInitializationError = null;
try {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  if (!firebaseConfig.apiKey) {
    throw new Error("Configuração do Firebase não encontrada. Verifique seu arquivo .env.local.");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Erro na inicialização do Firebase:", e);
  firebaseInitializationError = "Ocorreu um erro ao conectar aos nossos serviços. Por favor, recarregue a página.";
}

// --- FUNÇÕES AUXILIARES ---
const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    const newArray = [...array];
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
    }
    return newArray;
};

const generateSimpleUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


// --- COMPONENTES DA UI ---
const CustomAtomIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className} xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="14">
      <ellipse cx="128" cy="128" rx="32" ry="96" />
      <ellipse cx="128" cy="128" rx="32" ry="96" transform="rotate(60 128 128)" />
      <ellipse cx="128" cy="128" rx="32" ry="96" transform="rotate(120 128 128)" />
      <circle cx="128" cy="128" r="12" fill="currentColor" stroke="none" />
    </g>
  </svg>
);

const PlexusBackground = ({ theme }) => {
  const canvasRef = useRef(null);
  const themeColors = useMemo(() => {
    const themes = {
      light: { bg: '#f8fafc', particle: 'rgba(51, 65, 85, 0.5)', line: 'rgba(100, 116, 139, 0.5)' },
      paper: { bg: '#FDF6E3', particle: 'rgba(88, 75, 58, 0.4)', line: 'rgba(88, 75, 58, 0.4)' },
      pergaminho: { bg: '#EAE6E0', particle: 'rgba(106, 141, 159, 0.5)', line: 'rgba(106, 141, 159, 0.5)' },
      gray: { bg: '#d1d5db', particle: 'rgba(31, 41, 55, 0.5)', line: 'rgba(75, 85, 99, 0.5)' },
      graphite: { bg: '#374151', particle: 'rgba(0, 255, 255, 0.4)', line: 'rgba(0, 255, 255, 0.4)' },
      dark: { bg: '#020617', particle: 'rgba(0, 255, 255, 0.5)', line: 'rgba(0, 255, 255, 0.5)' }
    };
    return themes[theme] || themes.dark;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      let numberOfParticles = (canvas.height * canvas.width) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * .4) - .2;
        let directionY = (Math.random() * .4) - .2;
        particles.push(new Particle(x, y, directionX, directionY, size, themeColors.particle));
      }
    };

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            opacityValue = 1 - (distance / 20000);
            const lineColor = themeColors.line;
            if (lineColor) {
               ctx.strokeStyle = lineColor.replace(/[^,]+(?=\))/, opacityValue);
               ctx.lineWidth = 1;
               ctx.beginPath();
               ctx.moveTo(particles[a].x, particles[a].y);
               ctx.lineTo(particles[b].x, particles[b].y);
               ctx.stroke();
            }
          }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      canvas.style.backgroundColor = themeColors.bg;
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
    };
    
    resizeCanvas();
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [themeColors]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

const Spinner = ({ className = "h-16 w-16" }) => (
  <div className={`animate-spin rounded-full border-t-4 border-b-4 border-blue-500 ${className}`}></div>
);

const Modal = ({ title, children, onClose, showCloseButton = true, size = 'md' }) => {
  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl' };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-blue-500/30 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col text-gray-900 dark:text-white`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300">{title}</h3>
          {showCloseButton && <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"><XCircle size={24} /></button>}
        </div>
        <div className="p-1 md:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onConfirm]);

  return (
    <Modal title={title} onClose={onCancel}>
      <p className="mb-6 whitespace-pre-wrap">{message}</p>
      <div className="flex justify-end gap-4">
        <button onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
        <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Confirmar</button>
      </div>
    </Modal>
  );
};

const EditItemNameModal = ({ item, onSave, onClose }) => {
  const [name, setName] = useState(item.title);
  const modalTitle = item.type === 'folder' ? 'Renomear Pasta' : 'Renomear Lista';
  const label = item.type === 'folder' ? 'Nome da Pasta:' : 'Nome da Lista:';

  const handleSave = useCallback(() => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  }, [name, onSave, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <Modal title={modalTitle} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label htmlFor="item-name" className="font-semibold">{label}</label>
        <input id="item-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" autoFocus />
        <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">Salvar</button>
      </div>
    </Modal>
  );
};

const AddQuestionsModal = ({ onAdd, onFinish, onClose, onCreateErrorNotebook, hasErrors }) => (
  <Modal title="Quiz Finalizado!" onClose={onClose} showCloseButton={false}>
    <p className="text-center mb-4 text-lg">Parabéns por completar todas as questões!</p>
    <p className="text-center mb-6 text-gray-500 dark:text-gray-400">O que você gostaria de fazer agora?</p>
    <div className="flex flex-col gap-4">
      {hasErrors && (
        <button onClick={onCreateErrorNotebook} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
          <AlertTriangle size={20} /> Criar Caderno de Erros
        </button>
      )}
      <button onClick={onAdd} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">Adicionar Mais Questões</button>
      <button onClick={onFinish} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">Ver Relatório de Desempenho</button>
      <button onClick={onClose} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all duration-300">Fechar</button>
    </div>
  </Modal>
);

const AddMoreQuestionsFlowModal = ({ quiz, onGenerate, onClose }) => {
  const [step, setStep] = useState(1);
  const [numQuestions, setNumQuestions] = useState(10);
  const [newInstructions, setNewInstructions] = useState('');

  const lastInstructions = useMemo(() => {
    const history = quiz.data.customInstructionsHistory;
    if (Array.isArray(history) && history.length > 0) {
      return history[history.length - 1].instructions;
    }
    return "Nenhuma personalização foi usada anteriormente.";
  }, [quiz.data.customInstructionsHistory]);

  const handleGenerate = useCallback((instructions) => {
    onGenerate(quiz, numQuestions, instructions);
    onClose();
  }, [quiz, numQuestions, onGenerate, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Enter') return;
      if (step === 1) {
        e.preventDefault();
        setStep(2);
      } else if (step === 3 && newInstructions.trim()) {
        e.preventDefault();
        handleGenerate(newInstructions);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, newInstructions, handleGenerate]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <p className="text-center mb-6 text-gray-500 dark:text-gray-400">Quantas questões você gostaria de adicionar?</p>
            <div className="flex items-center gap-4 justify-center mb-6">
              <label htmlFor="num-questions-add-flow" className="font-semibold">Questões:</label>
              <input id="num-questions-add-flow" type="number" value={numQuestions} onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-24 px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:outline-none" min="1" autoFocus />
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all">Próximo</button>
          </>
        );
      case 2:
        return (
          <>
            <p className="mb-4">As últimas questões foram geradas com as seguintes instruções:</p>
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-300 dark:border-gray-700 max-h-32 overflow-y-auto">
              <p className="text-gray-600 dark:text-gray-300 italic">{lastInstructions}</p>
            </div>
            <p className="mb-6">Deseja manter essas instruções, definir novas ou gerar aleatoriamente para as próximas {numQuestions} questões?</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleGenerate(lastInstructions)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                <Bookmark size={20} /> Manter as mesmas instruções
              </button>
              <button onClick={() => setStep(3)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                <Edit size={20} /> Definir novas instruções
              </button>
              <button onClick={() => handleGenerate('')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                <Zap size={20} /> Zerar e gerar aleatoriamente
              </button>
              <button onClick={() => setStep(1)} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-all mt-2">Voltar</button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <p className="mb-4">Forneça as novas instruções para a geração das próximas {numQuestions} questões.</p>
            <textarea value={newInstructions} onChange={(e) => setNewInstructions(e.target.value)} placeholder="Ex: Foque nas seções de tratamento e diagnóstico..." className="w-full px-4 py-3 border-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:border-transparent transition placeholder:text-gray-400 min-h-[140px] resize-none bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 dark:bg-white/5 dark:border-white/20 dark:text-white dark:focus:ring-blue-400" autoFocus rows="5" />
            <div className="flex flex-col gap-3 mt-6">
              <button onClick={() => handleGenerate(newInstructions)} disabled={!newInstructions.trim()} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all disabled:bg-gray-400 dark:disabled:bg-gray-500">Gerar com Novas Instruções</button>
              <button onClick={() => setStep(2)} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-all">Voltar</button>
            </div>
          </>
        );
      default: return null;
    }
  };

  return (
    <Modal title="Adicionar Mais Questões" onClose={onClose}>
      {renderStep()}
    </Modal>
  );
};

const RequestMoreQuestionsModal = ({ onAdd, onClose, title, message }) => {
  const [numQuestions, setNumQuestions] = useState(10);
  const handleAddClick = useCallback(() => { onAdd(numQuestions); onClose(); }, [onAdd, numQuestions, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddClick]);

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-center mb-6 text-gray-500 dark:text-gray-400">{message}</p>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 justify-center">
          <label htmlFor="num-questions-add" className="font-semibold">Questões:</label>
          <input id="num-questions-add" type="number" value={numQuestions} onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-24 px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:outline-none" min="1" autoFocus />
        </div>
        <button onClick={handleAddClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">Adicionar</button>
      </div>
    </Modal>
  );
};

const CreateFolderModal = ({ onSave, onClose, parentId = null }) => {
  const [name, setName] = useState('');
  const handleSave = useCallback(() => {
    if (name.trim()) {
      onSave(name.trim(), parentId);
      onClose();
    }
  }, [name, onSave, parentId, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && name.trim()) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [name, handleSave]);

  return (
    <Modal title={parentId ? "Criar Nova Subpasta" : "Criar Nova Pasta"} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label htmlFor="folder-name" className="font-semibold">Nome da Pasta:</label>
        <input id="folder-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" autoFocus />
        <button onClick={handleSave} disabled={!name.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-500">Salvar</button>
      </div>
    </Modal>
  );
};

const getDescendantFolderIds = (folderId, allFolders) => {
  const descendants = new Set();
  const queue = [folderId];
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (currentId) {
      descendants.add(currentId);
      const children = allFolders.filter(f => f.parentId === currentId);
      for (const child of children) {
        queue.push(child.id);
      }
    }
  }
  return descendants;
};

const MoveItemModal = ({ itemToMove, folders, folderTree, onMove, onClose }) => {
  const disallowedIds = useMemo(() => {
    if (itemToMove?.type === 'folder') {
      return getDescendantFolderIds(itemToMove.id, folders);
    }
    return new Set();
  }, [itemToMove, folders]);

  const FolderOption = ({ folder, level = 0 }) => {
    const isDisabled = disallowedIds.has(folder.id);
    return (
      <>
        <button
          onClick={() => { if (!isDisabled) { onMove(folder.id); onClose(); } }}
          className={`w-full text-left p-3 rounded-lg transition-colors ${isDisabled ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          style={{ paddingLeft: `${1 + level * 1.5}rem` }}
          disabled={isDisabled}
        >
          {folder.name}
        </button>
        {!isDisabled && folder.children && folder.children.map(child => (
          <FolderOption key={child.id} folder={child} level={level + 1} />
        ))}
      </>
    );
  };

  return (
    <Modal title={`Mover "${itemToMove.title}"`} onClose={onClose}>
      <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
        <button onClick={() => { onMove(null); onClose(); }} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold">
          Raiz (Minhas Listas)
        </button>
        {folderTree.map(folder => (<FolderOption key={folder.id} folder={folder} />))}
      </div>
    </Modal>
  );
};

const ThemeSelectionScreen = ({ onThemeSelect, onConfirmTheme, onBack, currentTheme }) => {
  const themes = [
    { id: 'light', name: 'Claro', icon: Sun, bg: 'from-gray-100 to-gray-200', text: 'text-slate-800', iconColor: 'text-yellow-500', ringColor: 'ring-yellow-400' },
    { id: 'paper', name: 'Papel', icon: BookOpen, bg: 'from-[#FDF6E3] to-[#fbf0d5]', text: 'text-[#584B3A]', iconColor: 'text-[#B58900]', ringColor: 'ring-[#B58900]' },
    { id: 'pergaminho', name: 'Pergaminho', icon: Feather, bg: 'from-[#EAE6E0] to-[#F2F0EB]', text: 'text-[#333D44]', iconColor: 'text-[#6A8D9F]', ringColor: 'ring-[#6A8D9F]' },
    { id: 'gray', name: 'Cinza', icon: Cloud, bg: 'from-slate-400 to-slate-500', text: 'text-white', iconColor: 'text-slate-200', ringColor: 'ring-slate-300' },
    { id: 'graphite', name: 'Grafite', icon: Droplets, bg: 'from-gray-600 to-gray-700', text: 'text-white', iconColor: 'text-cyan-300', ringColor: 'ring-cyan-400' },
    { id: 'dark', name: 'Escuro', icon: Moon, bg: 'from-gray-800 to-slate-900', text: 'text-white', iconColor: 'text-blue-400', ringColor: 'ring-blue-400' }
  ];

  const isDarkTheme = ['dark', 'graphite', 'gray'].includes(currentTheme);

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center p-8 overflow-hidden">
      <div className={`relative z-10 text-center p-8 sm:p-12 w-full max-w-4xl mx-auto rounded-2xl border ${isDarkTheme ? 'bg-black/30 backdrop-blur-lg border-white/10' : 'bg-white/50 backdrop-blur-lg border-gray-300/50'}`}>
        <h1 className={`font-raleway text-4xl md:text-5xl font-light tracking-wider mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          Personalize a sua interface
        </h1>
        <p className={`font-raleway text-lg mb-10 max-w-2xl mx-auto leading-relaxed ${isDarkTheme ? 'text-gray-200/80' : 'text-gray-700'}`}>
          Clique em um tema para pré-visualizar. Quando estiver pronto, clique em "Avançar".
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onThemeSelect(theme.id)}
                className={`group relative bg-gradient-to-br ${theme.bg} ${theme.text} p-4 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 shadow-lg hover:shadow-2xl focus:outline-none flex flex-col items-center justify-center aspect-square ${isSelected ? `ring-4 ${theme.ringColor} border-transparent` : 'border-transparent'}`}
              >
                <Icon size={48} className={`mx-auto mb-2 ${theme.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                <h3 className="font-raleway text-md font-bold tracking-wide">{theme.name}</h3>
              </button>
            );
          })}
        </div>
        <div className="mt-12 flex justify-center items-center gap-6">
          <button onClick={onBack} className={`font-raleway font-bold py-3 px-8 rounded-lg text-lg transition-colors tracking-wider ${isDarkTheme ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
            Voltar
          </button>
          <button onClick={onConfirmTheme} className="font-raleway bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-10 rounded-lg text-lg transition-colors tracking-wider shadow-lg shadow-blue-500/30 flex items-center gap-2">
            Avançar <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const WelcomeScreen = ({ onStart, onShowFeatures }) => {
  const rotatingSentences = [
    "Aprimore seus conhecimentos com nosso método de estudos guiado e personalizável",
    "Desafie-se. Aprenda. Conquiste."
  ];

  const sideIcons = [Stethoscope, Microscope, BookOpen, FlaskConical, Dna, BrainCircuit];
  const leftIcons = sideIcons.slice(0, 3);
  const rightIcons = sideIcons.slice(3, 6);

  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSentenceIndex(prevIndex => (prevIndex + 1) % rotatingSentences.length);
      setAnimationKey(prevKey => prevKey + 1);
    }, 5000); // Change text every 5 seconds
    return () => clearInterval(interval);
  }, [rotatingSentences.length]);

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center p-4 sm:p-8 overflow-hidden">
      <div className="relative z-10 bg-black/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl text-center w-full max-w-xl border border-cyan-400/20 shadow-2xl shadow-cyan-500/10">
        <div className="relative flex justify-center items-center h-24 mb-4">
          <div className="flex items-center gap-x-5">
            {leftIcons.map((Icon, index) => (
              <Icon key={`left-${index}`} size={32} className="text-cyan-400/70 animate-pulse" style={{ animationDelay: `${index * 200}ms` }} />
            ))}
          </div>
          <div className="mx-6">
            <CustomAtomIcon size={64} className="text-cyan-400 animate-pulse" style={{ filter: "drop-shadow(0 0 1rem #06b6d4)" }} />
          </div>
          <div className="flex items-center gap-x-5">
            {rightIcons.map((Icon, index) => (
              <Icon key={`right-${index}`} size={32} className="text-cyan-400/70 animate-pulse" style={{ animationDelay: `${(index + 3) * 200}ms` }} />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h1 className="font-inter text-3xl md:text-4xl font-black uppercase tracking-wider">
            <span className="text-white">PLATAFORMA</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text"> MGQ</span>
          </h1>
          <p className="font-inter text-xl md:text-2xl font-black tracking-wider text-white mt-1">
            Meu Gerador de Questões
          </p>
        </div>
        <div className="h-16 flex items-center justify-center px-4">
          <p key={animationKey} className="font-lora animate-fade-slide text-lg text-center max-w-md italic text-cyan-300">
            {rotatingSentences[sentenceIndex]}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
          <button onClick={onStart} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/40">
            Iniciar
          </button>
          <button onClick={onShowFeatures} className="bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/40">
            Conheça as funcionalidades
          </button>
        </div>
      </div>
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60 z-20">
        Desenvolvido por Prof. Juan Santiago (2025)
      </footer>
    </div>
  );
};

const FeaturesScreen = ({ onBack }) => {
  const features = [
    { icon: Zap, title: "AUTONOMIA", text: ["Com a Plataforma MGQ, você pode gerar as suas próprias listas de questões sobre qualquer tema.", "Você pode escolher se deseja criar as questões baseando-se em um arquivo de preferência, ou escolher um tema e deixar que o nosso sistema consulte a base de dados e faça isso de forma automática.", "Após escolher a fonte base para a elaboração das questões, escolha quantas questões deseja criar inicialmente!"] },
    { icon: Target, title: "ACOMPANHAMENTO DO PROGRESSO E DESEMPENHO", text: ["Durante a resolução da lista, a cada questão resolvida, você poderá acompanhar o seu progresso (acertos e erros) de forma instantânea."] },
    { icon: BarChartHorizontal, title: "PAINEL DE NAVEGAÇÃO INTERATIVO", text: ["A Plataforma MGQ conta com um painel de navegação de questões interativo e fácil de usar, com funcionalidades que otimizam a sua produtividade!"] },
    { icon: Library, title: "AGRUPAMENTO DAS QUESTÕES EM TÓPICOS", text: ["O nosso sistema automaticamente agrupa as questões elaboradas de acordo com o tópico ao qual ela pertence. Por exemplo: ao gerar uma lista sobre “Insuficiência Cardíaca”, o sistema automaticamente agrupa as questões em tópicos como: “Diagnóstico”, “Tratamento”, “Exames Complementares”, e assim por diante."] },
    { icon: BarChart2, title: "RELATÓRIO DE DESEMPENHO", text: ["Ao finalizar uma lista, você terá acesso a um relatório do seu desempenho, com a sua porcentagem de acertos e erros total e em cada tópico! Assim, você poderá identificar seus pontos fortes e fracos, para que você direcionar melhor os seus estudos. Incrível, né?"] },
    { icon: PlusCircle, title: "POSSIBILIDADE DE ADICIONAR MAIS QUESTÕES", text: ["Finalizou uma lista, mas deseja continuar estudando? Sem problemas, a MGQ tem a solução: ao fim de uma lista de questões, você terá acesso ao seu relatório de desempenho e a uma opção de adicionar mais questões - você poderá inclusive escolher quantas questões você deseja adicionar!"] }
  ];
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNavigate = (direction) => {
    setIsAnimating(true);
    setTimeout(() => {
      if (direction === 'next') { setCurrentPage(prev => (prev + 1) % features.length); } else { setCurrentPage(prev => (prev - 1 + features.length) % features.length); }
      setIsAnimating(false);
    }, 300);
  };

  const currentFeature = features[currentPage];
  const Icon = currentFeature.icon;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4 md:p-8 text-white">
      <div className={`w-full max-w-2xl bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-12 text-center transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="mb-6"><div className="inline-block p-5 bg-blue-500/20 rounded-full"><Icon className="text-blue-300" size={56} /></div></div>
        <h2 className="text-2xl md:text-3xl font-bold text-blue-300 mb-6 uppercase tracking-wider">{currentFeature.title}</h2>
        <ul className="space-y-4 text-left">{currentFeature.text.map((point, index) => (<li key={index} className={`flex items-start gap-4 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`} style={{ transitionDelay: `${150 + index * 100}ms` }}><CheckCircle className="text-blue-400 mt-1 flex-shrink-0" size={20} /><span className="text-gray-300 leading-relaxed">{point.replace(/•\s/g, '')}</span></li>))}</ul>
      </div>
      <div className="mt-8 flex items-center justify-between w-full max-w-2xl">
        <button onClick={() => handleNavigate('prev')} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors disabled:opacity-50"><ChevronLeft size={24} /></button>
        <button onClick={onBack} className="bg-gray-200/20 hover:bg-gray-200/40 text-white font-bold py-2 px-6 rounded-lg transition-colors">Voltar</button>
        <button onClick={() => handleNavigate('next')} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors disabled:opacity-50"><ChevronRight size={24} /></button>
      </div>
      <div className="flex gap-2 mt-4">{features.map((_, index) => (<button key={index} onClick={() => setCurrentPage(index)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentPage === index ? 'bg-blue-400 scale-125' : 'bg-white/30 hover:bg-white/50'}`}></button>))}</div>
    </div>
  );
};

const SourceSelectionScreen = ({ onSourceSelect, onBack, theme }) => (
  <div className="w-full h-full flex flex-col justify-center items-center p-8 relative overflow-hidden">
    <div className="relative z-10 text-center p-8 w-full max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-sky-500 to-indigo-500 dark:from-sky-400 dark:to-indigo-400 text-transparent bg-clip-text">Como você quer criar seu quiz?</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-12 text-lg">Escolha a fonte do seu material de estudo.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <button onClick={() => onSourceSelect('file')} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:bg-blue-50/80 dark:hover:bg-blue-900/60 p-10 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-lg hover:shadow-blue-500/20"><FileText size={64} className="mx-auto mb-5 text-blue-500 dark:text-blue-400 transition-colors" /><h3 className="text-2xl font-bold mb-2">Anexar Arquivos</h3><p className="text-gray-500 dark:text-gray-400 transition-colors">Use seus próprios materiais (PDF, DOCX, TXT).</p></button>
        <button onClick={() => onSourceSelect('topic')} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:bg-green-50/80 dark:hover:bg-green-900/60 p-10 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 shadow-lg hover:shadow-green-500/20"><Library size={64} className="mx-auto mb-5 text-green-500 dark:text-green-400 transition-colors" /><h3 className="text-2xl font-bold mb-2">Escolher um Tema</h3><p className="text-gray-500 dark:text-gray-400 transition-colors">Deixe a IA gerar questões sobre um tema específico.</p></button>
        <button onClick={() => onSourceSelect('converter')} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:bg-purple-50/80 dark:hover:bg-purple-900/60 p-10 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 shadow-lg hover:shadow-purple-500/20"><Wand2 size={64} className="mx-auto mb-5 text-purple-500 dark:text-purple-400 transition-colors" /><h3 className="text-2xl font-bold mb-2">Converter Lista</h3><p className="text-gray-500 dark:text-gray-400 transition-colors">Transcreva um arquivo de questões para o formato do quiz.</p></button>
      </div>
      <div className="mt-16 text-center"><button onClick={onBack} className="bg-gray-200/80 hover:bg-gray-300/90 dark:bg-gray-600/80 dark:hover:bg-gray-500/90 backdrop-blur-md text-gray-800 dark:text-white font-bold py-3 px-10 rounded-lg text-lg transition-colors">Voltar</button></div>
    </div>
  </div>
);

const ProcessingIndicator = ({ message, progress }) => (
  <div className="w-full max-w-md text-center">
    <div className="mb-4"><FileText size={64} className="mx-auto text-blue-500 animate-pulse" /></div>
    <h3 className="text-xl font-bold mb-4">{message}</h3>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden"><div className="bg-gradient-to-r from-blue-400 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${progress}%` }}></div></div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{Math.round(progress)}%</p>
  </div>
);

const FileInputScreen = ({ onFilesProcessed, onBack, isPdfJsLoaded, isMammothLoaded, theme }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = [...files];
    let hasError = false;
    selectedFiles.forEach(file => {
      const allowedTypes = ["text/plain", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (allowedTypes.includes(file.type) && !files.some(f => f.name === file.name)) { newFiles.push(file); } else if (!allowedTypes.includes(file.type)) { setError(`Tipo de arquivo não suportado: ${file.name}`); hasError = true; }
    });
    if (!hasError) setError('');
    setFiles(newFiles);
  };

  const removeFile = (fileName) => { setFiles(files.filter(file => file.name !== fileName)); };

  const handleSubmit = useCallback(async () => {
    if (files.length === 0) { setError('Por favor, selecione pelo menos um arquivo.'); return; }
    setIsProcessing(true); setError('');
    const processedFiles = [];
    for (const file of files) {
      setProgress(0); setProcessingMessage(`Processando ${file.name}...`);
      try {
        let processedContent;
        if (file.type === "text/plain") { const text = await file.text(); processedContent = { name: file.name, pages: [{ page: 1, text }] }; }
        else if (file.type === "application/pdf") {
          if (!isPdfJsLoaded || !window.pdfjsLib) throw new Error("Leitor de PDF não está pronto.");
          const url = URL.createObjectURL(file); const pdf = await window.pdfjsLib.getDocument(url).promise; const pages = [];
          for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const pageTextContent = await page.getTextContent(); pages.push({ page: i, text: pageTextContent.items.map(item => item.str).join(' ') }); setProgress((i / pdf.numPages) * 100); }
          processedContent = { name: file.name, pages }; URL.revokeObjectURL(url);
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          if (!isMammothLoaded || !window.mammoth) throw new Error("Leitor de DOCX não está pronto.");
          const arrayBuffer = await file.arrayBuffer(); const result = await window.mammoth.extractRawText({ arrayBuffer }); processedContent = { name: file.name, pages: [{ page: 1, text: result.value }] }; setProgress(100);
        }
        processedFiles.push(processedContent);
      } catch (err) { console.error(`Erro ao processar ${file.name}:`, err); setError(`Ocorreu um erro ao ler o arquivo ${file.name}. Tente novamente.`); setIsProcessing(false); return; }
    }
    setProcessingMessage('Análise concluída!'); setProgress(100);
    setTimeout(() => onFilesProcessed(processedFiles), 1200);
  }, [files, isPdfJsLoaded, isMammothLoaded, onFilesProcessed]);

  const isContinueDisabled = files.length === 0 || isProcessing || (files.some(f => f.type === 'application/pdf') && !isPdfJsLoaded) || (files.some(f => f.type.includes('wordprocessingml')) && !isMammothLoaded);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !isContinueDisabled) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, isContinueDisabled]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-8 relative overflow-hidden">
      <div className="p-8 w-full max-w-2xl mx-auto relative z-10">
        {isProcessing ? (<ProcessingIndicator message={processingMessage} progress={progress} />) : (
          <div className="text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl">
            <h2 className="text-3xl font-bold mb-6">Anexe seus materiais</h2>
            <div className="mb-6">
              <label htmlFor="file-upload" className="w-full cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold py-10 px-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 flex flex-col items-center justify-center transition-colors"><FileText size={48} className="mb-2" /><span>Clique para selecionar os arquivos (.pdf, .docx, .txt)</span></label>
              <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.docx,.doc" multiple ref={fileInputRef} />
            </div>
            {files.length > 0 && (<div className="mb-4 text-left"><h3 className="font-bold mb-2">Arquivos Selecionados:</h3><ul className="space-y-2">{files.map(file => (<li key={file.name} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"><span className="truncate">{file.name}</span><button onClick={() => removeFile(file.name)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button></li>))}</ul></div>)}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              {files.some(f => f.type === 'application/pdf') && (<div className="flex items-center gap-2">{isPdfJsLoaded ? <CheckCircle size={18} className="text-green-500" /> : <Loader size={18} className="animate-spin" />}<span>PDF</span></div>)}
              {files.some(f => f.type.includes('wordprocessingml')) && (<div className="flex items-center gap-2">{isMammothLoaded ? <CheckCircle size={18} className="text-green-500" /> : <Loader size={18} className="animate-spin" />}<span>DOCX</span></div>)}
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex gap-4">
              <button onClick={onBack} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-3 rounded-lg transition-colors">Voltar</button>
              <button onClick={handleSubmit} disabled={isContinueDisabled} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed">Continuar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FileConverterInputScreen = ({ onFileProcessed, onBack, isPdfJsLoaded, theme }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Por favor, anexe um arquivo PDF.');
        setFile(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo PDF.');
      return;
    }
    setIsProcessing(true);
    setError('');
    setProgress(0);
    setProcessingMessage(`Processando ${file.name}...`);
    try {
      if (!isPdfJsLoaded || !window.pdfjsLib) throw new Error("Leitor de PDF não está pronto.");
      const url = URL.createObjectURL(file);
      const pdf = await window.pdfjsLib.getDocument(url).promise;
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const pageTextContent = await page.getTextContent();
        pages.push({ page: i, text: pageTextContent.items.map(item => item.str).join(' ') });
        setProgress((i / pdf.numPages) * 100);
      }
      const processedContent = { name: file.name, pages };
      URL.revokeObjectURL(url);
      setProcessingMessage('Análise concluída!');
      setProgress(100);
      setTimeout(() => onFileProcessed(processedContent), 1200);
    } catch (err) {
      console.error(`Erro ao processar ${file.name}:`, err);
      setError(`Ocorreu um erro ao ler o arquivo ${file.name}. Tente novamente.`);
      setIsProcessing(false);
    }
  }, [file, isPdfJsLoaded, onFileProcessed]);

  const isContinueDisabled = !file || isProcessing || !isPdfJsLoaded;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !isContinueDisabled) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, isContinueDisabled]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-8 relative overflow-hidden">
      <div className="p-8 w-full max-w-2xl mx-auto relative z-10">
        {isProcessing ? (
          <ProcessingIndicator message={processingMessage} progress={progress} />
        ) : (
          <div className="text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl">
            <h2 className="text-3xl font-bold mb-6">Converter Lista de Questões</h2>
            <div className="mb-6">
              <label htmlFor="file-upload-converter" className="w-full cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold py-10 px-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 flex flex-col items-center justify-center transition-colors">
                <Wand2 size={48} className="mb-2 text-purple-500" />
                <span>Clique para selecionar o arquivo PDF</span>
              </label>
              <input id="file-upload-converter" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" ref={fileInputRef} />
            </div>
            {file && (
              <div className="mb-4 text-left">
                <h3 className="font-bold mb-2">Arquivo Selecionado:</h3>
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                  <span className="truncate">{file.name}</span>
                  <button onClick={removeFile} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
              </div>
            )}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                {isPdfJsLoaded ? <CheckCircle size={18} className="text-green-500" /> : <Loader size={18} className="animate-spin" />}
                <span>Leitor de PDF</span>
              </div>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex gap-4">
              <button onClick={onBack} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-3 rounded-lg transition-colors">Voltar</button>
              <button onClick={handleSubmit} disabled={isContinueDisabled} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed">Continuar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ConversionQuestionCountScreen = ({ onConvert, onBack, theme }) => {
  const [numQuestions, setNumQuestions] = useState(50);
  const handleSubmit = (e) => { e.preventDefault(); onConvert(numQuestions); };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-8 relative overflow-hidden">
      <div className="text-center p-8 w-full max-w-lg mx-auto relative z-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl">
        <h2 className="text-3xl font-bold mb-6">Quantas questões você quer converter?</h2>
        <form onSubmit={handleSubmit}>
          <input type="number" value={numQuestions} onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" autoFocus min="1" />
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={onBack} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-3 rounded-lg transition-colors">Voltar</button>
            <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all duration-300">Iniciar Conversão</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FileOrderScreen = ({ onOrderSelect, onBack, theme }) => {
  const isDark = ['dark', 'graphite', 'gray'].includes(theme);
  return (
    <div className={`w-full h-full flex flex-col justify-center items-center p-8 relative overflow-hidden transition-colors duration-500`}>
      <div className="text-center p-8 w-full max-w-2xl mx-auto relative z-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl">
        <h2 className="text-3xl font-bold mb-4">Como organizar as questões?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Você adicionou mais de um arquivo. Deseja que as questões sejam misturadas ou que sigam a ordem dos arquivos que você enviou?</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => onOrderSelect('mixed')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">Misturar Questões</button>
          <button onClick={() => onOrderSelect('sequential')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">Manter Ordem dos Arquivos</button>
        </div>
        <div className="mt-12 text-center"><button onClick={onBack} className={`font-bold py-3 px-8 rounded-lg text-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Voltar</button></div>
      </div>
    </div>
  );
};

const ScreenWrapper = ({ children, isDark, theme }) => (
  <div className={`w-full h-full flex flex-col justify-center items-center p-8 relative overflow-hidden transition-colors duration-500`}>
    <div className="relative z-10 w-full max-w-2xl mx-auto">
      {children}
    </div>
  </div>
);

const CustomizationScreen = ({ onContinueWithPreferences, onContinueWithoutPreferences, onBack, theme }) => {
  const [showInput, setShowInput] = useState(false);
  const [preferences, setPreferences] = useState('');
  const isDark = ['dark', 'graphite', 'gray'].includes(theme);

  const handleYes = () => { setShowInput(true); };
  const handleSubmit = useCallback((e) => { e.preventDefault(); onContinueWithPreferences(preferences); }, [preferences, onContinueWithPreferences]);

  useEffect(() => {
    if (!showInput) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey && preferences.trim()) {
        e.preventDefault();
        onContinueWithPreferences(preferences);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInput, preferences, onContinueWithPreferences]);

  if (!showInput) {
    return (
      <ScreenWrapper isDark={isDark} theme={theme}>
        <div className="text-center p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Deseja personalizar as questões?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Nesta etapa, você pode fornecer instruções específicas para a IA gerar as questões, como focar em um capítulo ou tópico específico dentro do seu material.</p>
          <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg mb-8 text-left text-sm text-gray-500 dark:text-gray-400"><p><strong>Exemplo 1:</strong> "Utilize apenas as páginas 35 e 36 do documento."</p><p><strong>Exemplo 2:</strong> "Faça questões sobre todo o conteúdo, mas foque no assunto de tratamento farmacológico."</p></div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onBack} className={`flex-1 max-w-xs font-bold py-3 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Voltar</button>
            <button onClick={onContinueWithoutPreferences} className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">Não, gerar sobre tudo</button>
            <button onClick={handleYes} className="flex-1 max-w-xs bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors">Sim, personalizar</button>
          </div>
        </div>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper isDark={isDark} theme={theme}>
      <div className="text-center">
        <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Descreva suas preferências</h2>
        <p className={`mb-8 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Forneça as instruções para a geração das questões.</p>
        <div className={`${isDark ? 'bg-black/20' : 'bg-white/70'} backdrop-blur-md rounded-2xl p-8`}>
          <form onSubmit={handleSubmit}>
            <textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Ex: Foque nas seções de tratamento e diagnóstico..." className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:border-transparent transition placeholder:text-gray-400 min-h-[140px] resize-none ${isDark ? 'bg-white/5 border-white/20 text-white focus:ring-blue-400' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500'}`} autoFocus rows="5" />
            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setShowInput(false)} className={`flex-1 font-bold py-3 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Voltar</button>
              <button type="submit" disabled={!preferences.trim()} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:bg-gray-500/50 disabled:cursor-not-allowed">Continuar</button>
            </div>
          </form>
        </div>
      </div>
    </ScreenWrapper>
  );
};

const TopicInputScreen = ({ onTopicSubmit, onBack, theme }) => {
  const [topic, setTopic] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const isDark = theme === 'dark' || theme === 'graphite';
  useEffect(() => { const timer = setTimeout(() => setIsMounted(true), 100); return () => clearTimeout(timer); }, []);
  const handleSubmit = (e) => { e.preventDefault(); if (topic.trim()) { onTopicSubmit(topic.trim()); } };
  return (
    <div className={`w-full h-full flex flex-col justify-center items-center p-8 relative overflow-hidden transition-colors duration-500`}>
      <div className={`relative z-10 w-full max-w-2xl mx-auto text-center transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="mb-6"><Lightbulb size={64} className={`mx-auto ${isDark ? 'text-yellow-300' : 'text-yellow-500'}`} /></div>
        <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'bg-gradient-to-r from-blue-300 to-purple-400 text-transparent bg-clip-text' : 'text-gray-800'}`}>Qual tema você quer estudar hoje?</h2>
        <p className={`mb-8 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Informe o assunto ou cole um trecho de texto. Quanto mais detalhes você fornecer, melhores serão as questões.</p>
        <div className={`${isDark ? 'bg-black/20 backdrop-blur-md border-white/10' : 'bg-white/70 backdrop-blur-md border-gray-200/80 shadow-lg'} rounded-2xl border p-8`}>
          <form onSubmit={handleSubmit}>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex: Fisiopatologia da Insuficiência Cardíaca, com foco no tratamento segundo as últimas diretrizes da SBC..." className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:border-transparent transition placeholder:text-gray-400 min-h-[140px] resize-none ${isDark ? 'bg-white/5 border-white/20 text-white focus:ring-blue-400' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500'}`} autoFocus rows="5" />
            <div className="flex gap-4 mt-6">
              <button type="button" onClick={onBack} className={`flex-1 font-bold py-3 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Voltar</button>
              <button type="submit" disabled={!topic.trim()} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:bg-gray-500/50 disabled:cursor-not-allowed">Continuar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InitialQuestionCountScreen = ({ onGenerate, onBack, theme }) => {
  const [numQuestions, setNumQuestions] = useState(10);
  const handleSubmit = (e) => { e.preventDefault(); onGenerate(numQuestions); };
  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-8 relative overflow-hidden">
      <div className="text-center p-8 w-full max-w-lg mx-auto relative z-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl">
        <h2 className="text-3xl font-bold mb-6">Quantas questões você deseja?</h2>
        <form onSubmit={handleSubmit}>
          <input type="number" value={numQuestions} onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" autoFocus min="1" />
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={onBack} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-3 rounded-lg transition-colors">Voltar</button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all duration-300">Gerar Quiz</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoadingScreen = ({ text, progress, theme }) => {
  const messages = ["Você pode utilizar as setas do teclado para navegar entre as questões.", "Para salvar uma questão e revisá-la depois, clique no ícone de marcador ou aperte a tecla 's'.", "Para selecionar uma alternativa, aperte a tecla correspondente (a, b, c ou d)."];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const isDark = ['dark', 'graphite', 'gray'].includes(theme);

  useEffect(() => {
    const interval = setInterval(() => { setIsAnimating(false); setTimeout(() => { setCurrentMessageIndex(prev => (prev + 1) % messages.length); setIsAnimating(true); }, 500); }, 5000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={`w-screen h-screen flex flex-col justify-center items-center p-8 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
      <Spinner />
      <h2 className="text-3xl font-bold mt-8 mb-4">{text}</h2>
      <div className="w-full max-w-lg px-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-4 rounded-full transition-all duration-300 ease-linear" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-lg font-semibold mb-8">{`${Math.round(progress)}%`}</p>
      </div>
      <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-12 max-w-4xl">A nossa plataforma otimiza a sua experiência de aprendizado!</p>
      <div className="h-24 max-w-2xl"><div className={`transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}><div className="bg-gray-200/80 dark:bg-white/10 border border-gray-300/80 dark:border-white/20 rounded-lg p-4 flex items-center gap-4"><Lightbulb className="text-yellow-500 dark:text-yellow-300 flex-shrink-0" size={24} /><p className={`font-sans text-left ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{messages[currentMessageIndex]}</p></div></div></div>
    </div>
  );
};

const HighlightedContent = React.memo(({ html, highlights, onRemoveHighlight }) => {
  const processedHtml = useMemo(() => {
    if (!highlights || highlights.length === 0) return html;
    const container = document.createElement('div');
    container.innerHTML = html;
    const reversedHighlights = [...highlights].sort((a, b) => b.start - a.start);
    reversedHighlights.forEach(hl => {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let charCount = 0;
      let startNode, endNode, startOffset, endOffset;
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const nodeLength = node.textContent.length;
        if (startNode === undefined && hl.start >= charCount && hl.start < charCount + nodeLength) {
          startNode = node;
          startOffset = hl.start - charCount;
        }
        if (endNode === undefined && hl.end > charCount && hl.end <= charCount + nodeLength) {
          endNode = node;
          endOffset = hl.end - charCount;
          break;
        }
        charCount += nodeLength;
      }
      if (startNode && endNode) {
        try {
          const range = document.createRange();
          range.setStart(startNode, startOffset);
          range.setEnd(endNode, endOffset);

          const mark = document.createElement('mark');
          const colorMap = {
            yellow: 'rgba(255, 242, 0, 0.4)',
            green: 'rgba(134, 239, 172, 0.5)',
            cyan: 'rgba(103, 232, 249, 0.5)',
            pink: 'rgba(249, 168, 212, 0.5)',
          };
          mark.style.backgroundColor = colorMap[hl.color] || 'yellow';
          mark.dataset.highlightId = hl.id;
          mark.style.cursor = 'pointer';
          mark.title = 'Clique para remover destaque';
          range.surroundContents(mark);
        } catch (e) {
          console.error("Erro ao aplicar destaque:", e);
        }
      }
    });
    return container.innerHTML;
  }, [html, highlights]);

  const handleClick = (e) => {
    if (e.target.tagName === 'MARK' && e.target.dataset.highlightId) {
      e.stopPropagation();
      onRemoveHighlight(e.target.dataset.highlightId);
    }
  };

  return <div onClickCapture={handleClick} dangerouslySetInnerHTML={{ __html: processedHtml }} />;
});

const HighlightPopover = ({ x, y, onSelectColor, onClose }) => {
  const popoverRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const colors = [
    { name: 'yellow', hex: 'rgba(255, 242, 0, 0.4)' },
    { name: 'green', hex: 'rgba(134, 239, 172, 0.5)' },
    { name: 'cyan', hex: 'rgba(103, 232, 249, 0.5)' },
    { name: 'pink', hex: 'rgba(249, 168, 212, 0.5)' },
  ];

  return (
    <div ref={popoverRef} className="absolute z-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-1 flex gap-1" style={{ left: x, top: y }}>
      {colors.map(color => (
        <button key={color.name} onClick={() => onSelectColor(color.name)} className="w-6 h-6 rounded-full transition-transform hover:scale-110" style={{ backgroundColor: color.hex }} title={color.name} />
      ))}
    </div>
  );
};

const QuizScreen = ({ activeQuiz, onQuizUpdate, onFinish, onBackToList, onAddRequest, onAddConvertedRequest, onCreateErrorNotebook, theme, appId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState(activeQuiz.data.userAnswers || {});
  const [savedQuestions, setSavedQuestions] = useState(activeQuiz.data.savedQuestions || []);
  const [isDeepenModalOpen, setIsDeepenModalOpen] = useState(false);
  const [deepenContent, setDeepenContent] = useState('');
  const [isDeepening, setIsDeepening] = useState(false);
  const [showAddQuestionsModal, setShowAddQuestionsModal] = useState(false);
  const [quizCompletionNotified, setQuizCompletionNotified] = useState(activeQuiz.data.status === 'completed');
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
  const [navigationMode, setNavigationMode] = useState('all');
  const [highlightPopover, setHighlightPopover] = useState({ visible: false, x: 0, y: 0 });
  const questionRef = useRef(null);
  const isDark = ['dark', 'graphite'].includes(theme);
  const isAnsweredRef = useRef(isAnswered);
  useEffect(() => { isAnsweredRef.current = isAnswered; }, [isAnswered]);
  const userId = auth.currentUser?.uid;
  const isConvertedQuiz = activeQuiz.data.title?.startsWith('Conversão:');

  const { correctCount, incorrectCount, answeredCount } = useMemo(() => {
    return Object.values(userAnswers).reduce((acc, ans) => {
      if (typeof ans.isCorrect === 'boolean') {
        ans.isCorrect ? acc.correctCount++ : acc.incorrectCount++;
        acc.answeredCount++;
      }
      return acc;
    }, { correctCount: 0, incorrectCount: 0, answeredCount: 0 });
  }, [userAnswers]);

  const allAnswered = useMemo(() => (activeQuiz.data.quizData?.length || 0) > 0 && answeredCount === (activeQuiz.data.quizData?.length || 0), [answeredCount, activeQuiz.data.quizData]);

  useEffect(() => {
    if (allAnswered && !quizCompletionNotified && (activeQuiz.data.quizData?.length || 0) > 0) {
      const timer = setTimeout(() => {
        setShowAddQuestionsModal(true);
        setQuizCompletionNotified(true);
        if (userId) {
          const quizRef = doc(db, "artifacts", appId, "users", userId, "quizzes", activeQuiz.id);
          updateDoc(quizRef, { status: 'completed' });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allAnswered, quizCompletionNotified, userId, appId, activeQuiz.id, activeQuiz.data.quizData]);

  useEffect(() => {
    const currentAnswerData = userAnswers[currentQuestionIndex];
    if (currentAnswerData && typeof currentAnswerData.selected === 'number') {
      setSelectedAnswer(currentAnswerData.selected);
      setIsAnswered(true);
    } else {
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
    setHighlightPopover({ visible: false, x: 0, y: 0 });
  }, [currentQuestionIndex, userAnswers]);

  const updateQuizInFirestore = useCallback(async (updatedData) => {
    if (!userId) return;
    const quizRef = doc(db, "artifacts", appId, "users", userId, "quizzes", activeQuiz.id);
    await updateDoc(quizRef, updatedData);
    onQuizUpdate(activeQuiz.id, updatedData);
  }, [userId, appId, activeQuiz.id, onQuizUpdate]);

  const handleAnswerSelect = (optionIndex) => { if (!isAnswered) setSelectedAnswer(optionIndex); };
  const navigateToQuestion = useCallback((index) => { if (index >= 0 && index < (activeQuiz.data.quizData?.length || 0)) setCurrentQuestionIndex(index); }, [activeQuiz.data.quizData]);

  const confirmAnswer = useCallback(() => {
    if (selectedAnswer === null || isAnswered) return;
    const question = activeQuiz.data.quizData[currentQuestionIndex];
    if (!question || !question.options || !question.options[selectedAnswer]) { console.error("Dados da questão inválidos"); return; }
    const isCorrect = question.options[selectedAnswer].isCorrect;
    const newAnswers = { ...userAnswers, [currentQuestionIndex]: { ...userAnswers[currentQuestionIndex], selected: selectedAnswer, isCorrect } };
    setUserAnswers(newAnswers); setIsAnswered(true);
    updateQuizInFirestore({ userAnswers: newAnswers });
  }, [selectedAnswer, isAnswered, activeQuiz.data.quizData, currentQuestionIndex, userAnswers, updateQuizInFirestore]);

  const toggleSaveQuestion = useCallback(async () => {
    if (!userId) return;
    const isSaving = !savedQuestions.includes(currentQuestionIndex);
    const questionToModify = activeQuiz.data.quizData[currentQuestionIndex];
    if (!questionToModify) {
      console.error("Tentativa de salvar uma questão inválida.");
      return;
    }
    const newSaved = isSaving ? [...savedQuestions, currentQuestionIndex] : savedQuestions.filter(i => i !== currentQuestionIndex);
    setSavedQuestions(newSaved);
    updateQuizInFirestore({ savedQuestions: newSaved });

    const savedFolderName = "Questões Salvas";
    const savedQuizName = "Minhas Questões Salvas";
    try {
      const foldersRef = collection(db, "artifacts", appId, "users", userId, "folders");
      const qFolder = query(foldersRef, where("name", "==", savedFolderName));
      const folderSnapshot = await getDocs(qFolder);
      let savedFolderId;
      if (folderSnapshot.empty) {
        const newFolderRef = await addDoc(foldersRef, {
          name: savedFolderName,
          parentId: null,
          createdAt: serverTimestamp(),
          isFavorited: true,
        });
        savedFolderId = newFolderRef.id;
      } else {
        savedFolderId = folderSnapshot.docs[0].id;
      }
      const quizzesRef = collection(db, "artifacts", appId, "users", userId, "quizzes");
      const qQuiz = query(quizzesRef, where("title", "==", savedQuizName), where("folderId", "==", savedFolderId));
      const quizSnapshot = await getDocs(qQuiz);
      if (isSaving) {
        if (quizSnapshot.empty) {
          await addDoc(quizzesRef, {
            title: savedQuizName,
            folderId: savedFolderId,
            createdAt: serverTimestamp(),
            quizData: [questionToModify],
            userAnswers: {},
            savedQuestions: [],
            isFavorited: true,
            sourceType: 'saved'
          });
        } else {
          const savedQuizDocRef = doc(db, "artifacts", appId, "users", userId, "quizzes", quizSnapshot.docs[0].id);
          await updateDoc(savedQuizDocRef, {
            quizData: arrayUnion(questionToModify)
          });
        }
      } else {
        if (!quizSnapshot.empty) {
          const savedQuizDocRef = doc(db, "artifacts", appId, "users", userId, "quizzes", quizSnapshot.docs[0].id);
          await updateDoc(savedQuizDocRef, {
            quizData: arrayRemove(questionToModify)
          });
        }
      }
    } catch (error) {
      console.error("Erro ao gerenciar a lista de questões salvas:", error);
      setSavedQuestions(savedQuestions);
      updateQuizInFirestore({ savedQuestions: savedQuestions });
    }
  }, [savedQuestions, currentQuestionIndex, userId, updateQuizInFirestore, activeQuiz.data.quizData, appId]);

  const handleDeleteQuestion = useCallback(async (indexToDelete) => {
    if ((activeQuiz.data.quizData?.length || 0) <= 1) { console.log("Cannot delete the last question."); setConfirmDeleteIndex(null); return; }
    const newQuizData = [...activeQuiz.data.quizData]; newQuizData.splice(indexToDelete, 1);
    const newAnswers = {};
    Object.entries(userAnswers).forEach(([key, value]) => {
      const oldIndex = parseInt(key, 10);
      if (oldIndex < indexToDelete) { newAnswers[oldIndex] = value; } else if (oldIndex > indexToDelete) { newAnswers[oldIndex - 1] = value; }
    });
    const newSaved = savedQuestions.map(savedIndex => { if (savedIndex < indexToDelete) return savedIndex; if (savedIndex > indexToDelete) return savedIndex - 1; return -1; }).filter(index => index !== -1);
    setUserAnswers(newAnswers); setSavedQuestions(newSaved);
    await updateQuizInFirestore({ quizData: newQuizData, userAnswers: newAnswers, savedQuestions: newSaved });
    if (currentQuestionIndex >= indexToDelete) { setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1)); }
    setConfirmDeleteIndex(null);
  }, [activeQuiz.data.quizData, userAnswers, savedQuestions, currentQuestionIndex, updateQuizInFirestore]);

  const handleDeepenTopic = async () => {
      const currentTopic = activeQuiz.data.quizData[currentQuestionIndex].topic;
      setIsDeepenModalOpen(true); setIsDeepening(true); setDeepenContent('');
      try {
          const prompt = `Aprofunde o seguinte tópico para um estudante universitário de acordo com as seguintes situações: 1. (Se for um tópico de medicina, explique a fisiopatologia, quadro clínico, diagnóstico e tratamento de forma detalhada e didática. Use diretrizes médicas brasileiras como referência quando aplicável, citando a fonte, o ano, e onde ela está acessível.) e 2. (Se não for um tópico de medicina, aprofunde de acordo com livros técnicos, artigos científicos e fontes confiáveis e cite a fonte da informação e onde ela está acessível). Tópico: "${currentTopic}"`;

          // This function now calls the secure backend
          const resultText = await callApiSecurely(prompt);
          setDeepenContent(resultText);

      } catch (error) {
          console.error("Erro ao aprofundar tópico:", error);
          setDeepenContent(`Desculpe, não foi possível aprofundar o tópico. ${error.message}`);
      } finally {
          setIsDeepening(false);
      }
  };


  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection.isCollapsed && questionRef.current && questionRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setHighlightPopover({ visible: true, x: rect.left + window.scrollX, y: rect.top + window.scrollY - 40 });
    } else {
      if (!highlightPopover.visible) {
        setHighlightPopover({ visible: false, x: 0, y: 0 });
      }
    }
  };

  const applyHighlight = (color) => {
    const selection = window.getSelection();
    if (!selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const container = questionRef.current;
      const preSelectionRange = document.createRange();
      preSelectionRange.selectNodeContents(container);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;
      const end = start + range.toString().length;

      const newHighlight = { id: generateSimpleUUID(), start, end, color };
      const currentHighlights = userAnswers[currentQuestionIndex]?.highlights || [];
      const updatedHighlights = [...currentHighlights, newHighlight];
      const newAnswers = { ...userAnswers, [currentQuestionIndex]: { ...userAnswers[currentQuestionIndex], highlights: updatedHighlights } };

      setUserAnswers(newAnswers);
      updateQuizInFirestore({ userAnswers: newAnswers });

      selection.removeAllRanges();
      setHighlightPopover({ visible: false, x: 0, y: 0 });
    }
  };

  const removeHighlight = (highlightId) => {
    const currentHighlights = userAnswers[currentQuestionIndex]?.highlights || [];
    const updatedHighlights = currentHighlights.filter(h => h.id !== highlightId);
    const newAnswers = { ...userAnswers, [currentQuestionIndex]: { ...userAnswers[currentQuestionIndex], highlights: updatedHighlights } };
    setUserAnswers(newAnswers);
    updateQuizInFirestore({ userAnswers: newAnswers });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
      if (isDeepenModalOpen || showAddQuestionsModal || confirmDeleteIndex !== null) return;
      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'arrowdown') return;
      if (['s', 'enter', 'arrowright', 'arrowleft', 'a', 'b', 'c', 'd', 'delete'].includes(key)) e.preventDefault();
      if (key === 'arrowright') {
        if (navigationMode === 'saved' && savedQuestions.length > 0) {
          const sortedSaved = [...savedQuestions].sort((a, b) => a - b);
          const currentIndexInSaved = sortedSaved.indexOf(currentQuestionIndex);
          if (currentIndexInSaved > -1 && currentIndexInSaved < sortedSaved.length - 1) { navigateToQuestion(sortedSaved[currentIndexInSaved + 1]); }
        } else { navigateToQuestion(currentQuestionIndex + 1); }
      } else if (key === 'arrowleft') {
        if (navigationMode === 'saved' && savedQuestions.length > 0) {
          const sortedSaved = [...savedQuestions].sort((a, b) => a - b);
          const currentIndexInSaved = sortedSaved.indexOf(currentQuestionIndex);
          if (currentIndexInSaved > 0) { navigateToQuestion(sortedSaved[currentIndexInSaved - 1]); }
        } else { navigateToQuestion(currentQuestionIndex - 1); }
      } else if (key === 's') { toggleSaveQuestion(); } else if (key === 'enter') { isAnsweredRef.current ? navigateToQuestion(currentQuestionIndex + 1) : confirmAnswer(); } else if (key === 'delete') { setConfirmDeleteIndex(currentQuestionIndex); } else if (!isAnsweredRef.current && key >= 'a' && key <= 'd') { handleAnswerSelect(key.charCodeAt(0) - 'a'.charCodeAt(0)); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, activeQuiz.data.quizData, isDeepenModalOpen, showAddQuestionsModal, confirmDeleteIndex, toggleSaveQuestion, navigateToQuestion, confirmAnswer, navigationMode, savedQuestions]);

  const currentQuestion = activeQuiz.data.quizData?.[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lista de Questões Vazia</h2>
          <p>Não há mais questões nesta lista.</p>
          <button onClick={onBackToList} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Voltar para Minhas Listas</button>
        </div>
      </div>
    );
  }

  const markdownToHtml = (text) => text ? text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`(.*?)`/g, '<code>$1</code>').replace(/\n/g, '<br />') : '';
  const correctOption = currentQuestion.options.find(opt => opt.isCorrect);

  const handleAddMoreClick = () => {
    if (isConvertedQuiz) {
      onAddConvertedRequest(activeQuiz);
    } else {
      onAddRequest(activeQuiz);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full font-sans">
      {highlightPopover.visible && <HighlightPopover x={highlightPopover.x} y={highlightPopover.y} onSelectColor={applyHighlight} onClose={() => setHighlightPopover({ visible: false, x: 0, y: 0 })} />}
      {confirmDeleteIndex !== null && (<ConfirmationModal title="Excluir Questão" message={`Tem certeza que deseja excluir a questão ${confirmDeleteIndex + 1}? Esta ação não pode ser desfeita.`} onConfirm={() => handleDeleteQuestion(confirmDeleteIndex)} onCancel={() => setConfirmDeleteIndex(null)} />)}
      {showAddQuestionsModal && <AddQuestionsModal onClose={() => setShowAddQuestionsModal(false)} onAdd={() => { setShowAddQuestionsModal(false); onAddRequest(activeQuiz); }} onFinish={() => onFinish(activeQuiz)} onCreateErrorNotebook={() => { setShowAddQuestionsModal(false); onCreateErrorNotebook(activeQuiz); }} hasErrors={incorrectCount > 0} />}

      <aside className={`w-full md:w-80 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-r border-gray-200/80 dark:border-gray-700/50 p-6 flex-shrink-0 flex flex-col`}>
        <div className="flex-grow overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-300">Questões</h3>
          <div className="grid grid-cols-5 md:grid-cols-4 gap-2 mb-8">{activeQuiz.data.quizData.map((_, index) => { const answer = userAnswers[index]; let statusClass = 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'; if (answer && typeof answer.isCorrect === 'boolean') statusClass = answer.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'; if (index === currentQuestionIndex) statusClass += ' ring-2 ring-blue-400'; return (<div key={index} className="relative group question-nav-item"><button onClick={() => { navigateToQuestion(index); setNavigationMode('all'); }} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-200 ${statusClass}`}>{index + 1}</button><button onClick={() => setConfirmDeleteIndex(index)} className="delete-icon absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors z-10"><Trash2 size={12} /></button></div>); })}</div>
          <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-300">Progresso</h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300 mb-8">
            <div className="flex justify-between items-center"><span className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500 dark:text-green-400" /> Corretas</span><span className="font-bold">{correctCount}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-2"><XCircle size={18} className="text-red-500 dark:text-red-400" /> Incorretas</span><span className="font-bold">{incorrectCount}</span></div>
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2`}><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(answeredCount / activeQuiz.data.quizData.length) * 100}%` }}></div></div>
          </div>
          <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-300">Salvas</h3>
          {savedQuestions.length > 0 ? <div className="flex flex-wrap gap-2">{savedQuestions.sort((a,b) => a-b).map(qIndex => <button key={`saved-${qIndex}`} onClick={() => { navigateToQuestion(qIndex); setNavigationMode('saved'); }} className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-1 px-3 rounded-md transition-colors">{qIndex + 1}</button>)}</div> : <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma questão salva.</p>}
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {allAnswered ? (<><button onClick={handleAddMoreClick} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"><PlusCircle size={20} /> Adicionar mais questões</button><button onClick={() => onFinish(activeQuiz)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"><BarChart2 size={20} /> Abrir Relatório</button></>) : (<button onClick={handleAddMoreClick} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"><PlusCircle size={20} /> Adicionar mais questões</button>)}
          <button onClick={onBackToList} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"><Library size={20} /> Minhas Listas</button>
        </div>
      </aside>

      <main className={`flex-1 p-6 md:p-12 overflow-y-auto transition-colors duration-300 bg-transparent`}>
        <div className={`max-w-4xl mx-auto rounded-2xl p-8 transition-all duration-300 bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/50 shadow-2xl`}>
          <div className="flex justify-between items-start mb-4">
            <div><p className="text-blue-600 dark:text-blue-400 font-semibold">Questão {currentQuestionIndex + 1}/{activeQuiz.data.quizData.length}</p><p className="text-gray-500 dark:text-gray-400 text-sm">{currentQuestion.topic}</p></div>
            <button onClick={toggleSaveQuestion} className={`p-2 rounded-full transition-colors ${savedQuestions.includes(currentQuestionIndex) ? 'bg-yellow-400 text-black' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'}`}><Bookmark size={20} /></button>
          </div>
          <div ref={questionRef} onMouseUp={handleMouseUp} className={`mb-8 p-6 bg-transparent border border-gray-300 dark:border-gray-600 shadow-inner rounded-xl`}>
            <h2 className="font-open-sans text-justify text-xl">
              <HighlightedContent html={markdownToHtml(currentQuestion.question)} highlights={userAnswers[currentQuestionIndex]?.highlights || []} onRemoveHighlight={removeHighlight} />
            </h2>
          </div>
          <div className="space-y-3 mb-8">{currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            if (isAnswered) {
              const isCorrectOption = option.isCorrect;
              const isSelectedAnswer = userAnswers[currentQuestionIndex]?.selected === index;
              let optionClass = isDark ? 'bg-gray-800/50 border-gray-700 opacity-50' : 'bg-gray-100 border-gray-300 opacity-60';
              if (isCorrectOption) optionClass = isDark ? 'bg-green-900/70 border-green-700' : 'bg-green-100 border-green-500';
              else if (isSelectedAnswer) optionClass = isDark ? 'bg-red-900/70 border-red-700' : 'bg-red-100 border-red-500';
              return (
                <div key={index} className={`p-3 border-2 transition-all duration-200 flex items-center gap-4 rounded-lg ${optionClass}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold`}>{String.fromCharCode(65 + index)}</div>
                  <div className={`flex-1 font-open-sans text-justify text-base`} dangerouslySetInnerHTML={{ __html: markdownToHtml(option.text) }}></div>
                  {isCorrectOption && <CheckCircle className="text-green-400" size={24} />}
                  {isSelectedAnswer && !isCorrectOption && <XCircle className="text-red-400" size={24} />}
                </div>
              );
            } else {
              let optionClass = isSelected ? (isDark ? 'bg-blue-900/80 border-blue-700' : 'bg-blue-600 border-blue-600') : (isDark ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-300 hover:border-blue-500');
              return (
                <div key={index} onClick={() => handleAnswerSelect(index)} className={`p-3 border-2 transition-all duration-200 cursor-pointer flex items-center gap-4 rounded-lg ${optionClass}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${isSelected ? (isDark ? 'bg-white text-blue-800' : 'bg-white text-blue-600') : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}>{String.fromCharCode(65 + index)}</div>
                  <div className={`flex-1 font-open-sans text-justify text-base ${isSelected ? 'text-white' : (isDark ? 'text-gray-300' : 'text-gray-800')}`} dangerouslySetInnerHTML={{ __html: markdownToHtml(option.text) }}></div>
                </div>
              );
            }
          })}</div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {!isAnswered ? <button onClick={confirmAnswer} disabled={selectedAnswer === null} className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed">Confirmar</button> : <button onClick={() => navigateToQuestion(currentQuestionIndex + 1)} disabled={currentQuestionIndex === activeQuiz.data.quizData.length - 1} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center gap-2">Próxima Questão <ArrowRight size={20} /></button>}
            <button onClick={handleDeepenTopic} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"><Sparkles size={20} /> Aprofundar</button>
          </div>
          {isAnswered && (
            <div className={`mt-10 p-6 bg-gray-100 dark:bg-gray-800/80 rounded-lg`}>
              <h3 className="text-2xl font-bold mb-4 text-yellow-600 dark:text-yellow-400">Análise da Questão</h3>
              {isConvertedQuiz ? (correctOption && correctOption.explanation && (<div className={`p-4 rounded-md bg-white dark:bg-gray-900/50 border-l-4 border-green-500`}><p className="font-bold mb-2 text-lg text-gray-800 dark:text-gray-200">Justificativa da Resposta Correta</p><div className="prose dark:prose-invert max-w-none font-open-sans text-justify" dangerouslySetInnerHTML={{ __html: markdownToHtml(correctOption.explanation) }}></div></div>)) : (<div className="space-y-4">{currentQuestion.options.map((option, index) => (option.explanation && (<div key={index} className={`p-4 rounded-md bg-white dark:bg-gray-900/50 border-l-4 ${option.isCorrect ? 'border-green-500' : 'border-red-500'}`}><p className="font-bold mb-2 text-lg text-gray-800 dark:text-gray-200">Alternativa {String.fromCharCode(97 + index)} ({option.isCorrect ? 'Correta' : 'Incorreta'})</p><div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(option.explanation) }}></div></div>)))}</div>)}
              {currentQuestion.guideline && <div className={`mt-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-md border-l-4 border-blue-400`}><p className="font-semibold text-blue-600 dark:text-blue-300">Referência:</p><p className="text-gray-600 dark:text-gray-300 text-sm">{currentQuestion.guideline}</p></div>}
            </div>
          )}
        </div>
      </main>
      {isDeepenModalOpen && <Modal title={`Aprofundando: ${activeQuiz.data.quizData[currentQuestionIndex].topic}`} onClose={() => setIsDeepenModalOpen(false)} size="3xl">{isDeepening ? <div className="flex justify-center items-center h-48"><Spinner /></div> : <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg"><div className="deepen-content prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(deepenContent) }}></div></div>}</Modal>}
    </div>
  );
};

const ResultsScreen = ({ activeQuiz, onBackToList, onReview, onAddRequest, onAddConvertedRequest, onCreateErrorNotebook, theme }) => {
  const { quizData, userAnswers, title } = activeQuiz.data;
  const isConvertedQuiz = title?.startsWith('Conversão:');
  const isDark = ['dark', 'graphite', 'gray'].includes(theme);

  const { totalCorrect, totalIncorrect, resultsByTopic, totalQuestions, overallPercentage } = useMemo(() => {
    const topics = {};
    let correct = 0;
    quizData.forEach((q, index) => {
      if (!topics[q.topic]) topics[q.topic] = { total: 0, correct: 0 };
      topics[q.topic].total++;
      if (userAnswers[index]?.isCorrect) {
        topics[q.topic].correct++;
        correct++;
      }
    });
    const answeredCount = Object.values(userAnswers).filter(a => typeof a.isCorrect === 'boolean').length;
    const incorrect = answeredCount - correct;
    const percentage = quizData.length > 0 ? (correct / quizData.length) * 100 : 0;
    return { totalCorrect: correct, totalIncorrect: incorrect, resultsByTopic: topics, totalQuestions: quizData.length, overallPercentage: percentage };
  }, [quizData, userAnswers]);

  const handleAddMoreClick = () => {
    if (isConvertedQuiz) {
      onAddConvertedRequest(activeQuiz);
    } else {
      onAddRequest(activeQuiz);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-6 md:p-10">
      <div className={`max-w-4xl mx-auto bg-white/80 dark:bg-gray-900/70 backdrop-blur-md p-8 rounded-2xl w-full ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <h1 className="text-4xl font-bold text-center mb-2">Análise de Desempenho</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 font-semibold">{title}</p>
        <div className="bg-gray-100 dark:bg-gray-800/80 p-6 rounded-xl mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Resultado Geral</h2>
          <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">{overallPercentage.toFixed(1)}%</p>
          <p className="text-lg text-gray-700 dark:text-gray-300">({totalCorrect} de {totalQuestions} questões corretas)</p>
        </div>
        <h2 className="text-2xl font-bold mb-4">Desempenho por Tópico</h2>
        <div className="space-y-4">{Object.entries(resultsByTopic).map(([topic, data]) => { const percentage = (data.correct / data.total) * 100; let colorClass = 'bg-green-500'; if (percentage < 70) colorClass = 'bg-yellow-500'; if (percentage < 40) colorClass = 'bg-red-500'; return (<div key={topic} className="bg-gray-100 dark:bg-gray-800/80 p-4 rounded-lg"><div className="flex justify-between items-center mb-2"><h3 className="font-bold text-lg text-gray-900 dark:text-white">{topic}</h3><span className="font-semibold text-gray-800 dark:text-gray-200">{data.correct}/{data.total} ({percentage.toFixed(0)}%)</span></div><div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5"><div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div></div></div>); })}</div>
        <div className="text-center mt-10 flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
          <button onClick={onBackToList} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">Minhas Listas</button>
          <button onClick={() => onReview(activeQuiz)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">Revisar Questões</button>
          <button onClick={handleAddMoreClick} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">Adicionar Mais Questões</button>
          {totalIncorrect > 0 && (
            <button onClick={() => onCreateErrorNotebook(activeQuiz)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors flex items-center justify-center gap-2">
              <AlertTriangle size={20} /> Criar Caderno de Erros
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PerformanceDashboard = ({ totalAnswered, totalCorrect, totalIncorrect, accuracy, theme }) => {
  const isDark = ['dark', 'graphite', 'gray'].includes(theme);
  const stats = [
    { label: 'Total Resolvidas', value: totalAnswered, icon: CheckCircle, color: 'text-blue-500 dark:text-blue-400' },
    { label: 'Total de Acertos', value: totalCorrect, icon: CheckCircle, color: 'text-green-500 dark:text-green-400' },
    { label: 'Total de Erros', value: totalIncorrect, icon: XCircle, color: 'text-red-500 dark:text-red-400' },
    { label: '% de Acertos', value: `${accuracy.toFixed(1)}%`, icon: Target, color: 'text-purple-500 dark:text-purple-400' }
  ];
  return (
    <div className="mb-8 p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50">
      <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Seu Desempenho Geral</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => { const Icon = stat.icon; return (<div key={index} className={`bg-gray-100/50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center gap-4`}><div className={`p-3 rounded-full bg-white/50 dark:bg-gray-800 ${stat.color}`}><Icon size={24} /></div><div><p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p><p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p></div></div>); })}
      </div>
    </div>
  );
};

const QuizListScreen = ({ user, onStartNewQuiz, onSelectQuiz, theme, onBack, onShowPerformance, appId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [viewMode, setViewMode] = useState('folders');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmRestart, setConfirmRestart] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [movingItem, setMovingItem] = useState(null);
  const [createFolderState, setCreateFolderState] = useState({ isOpen: false, parentId: null });
  const [viewingInstructions, setViewingInstructions] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([{ id: null, name: 'Minhas Listas' }]);
  const userId = user?.uid;
  const isDark = ['dark', 'graphite', 'gray'].includes(theme);

  const getStatus = useCallback((quiz) => {
    const answeredCount = Object.values(quiz.userAnswers || {}).filter(a => typeof a.isCorrect === 'boolean').length;
    const totalCount = quiz.quizData?.length || 0;
    if (quiz.status === 'completed' || (totalCount > 0 && answeredCount === totalCount)) return 'completed';
    if (answeredCount > 0) return 'in-progress';
    return 'not-started';
  }, []);

  const navigateToFolder = (folder) => {
    setCurrentFolderId(folder.id);
    setFolderPath(prevPath => [...prevPath, { id: folder.id, name: folder.name }]);
  };
  const navigateByBreadcrumb = (folderId, index) => {
    setCurrentFolderId(folderId);
    setFolderPath(prevPath => prevPath.slice(0, index + 1));
  };

  const InstructionsModal = ({ history, onClose }) => (
    <Modal title="Histórico de Instruções" onClose={onClose} size="lg">
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {history.map((item, index) => (
          <div key={index} className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">
              {item.timestamp && new Date(item.timestamp.seconds * 1000).toLocaleString()}
            </p>
            <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{item.instructions || "Nenhuma instrução específica."}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Fechar</button>
      </div>
    </Modal>
  );

  useEffect(() => {
    if (!userId) return;
    const quizzesQuery = query(collection(db, "artifacts", appId, "users", userId, "quizzes"));
    const foldersQuery = query(collection(db, "artifacts", appId, "users", userId, "folders"));
    const unsubQuizzes = onSnapshot(quizzesQuery, (querySnapshot) => { const quizzesData = []; querySnapshot.forEach((doc) => quizzesData.push({ id: doc.id, ...doc.data() })); setQuizzes(quizzesData); });
    const unsubFolders = onSnapshot(foldersQuery, (querySnapshot) => { const foldersData = []; querySnapshot.forEach((doc) => foldersData.push({ id: doc.id, ...doc.data() })); setFolders(foldersData); });
    return () => { unsubQuizzes(); unsubFolders(); };
  }, [userId, appId]);

  const performanceStats = useMemo(() => {
    let totalAnswered = 0;
    let totalCorrect = 0;
    quizzes.forEach(quiz => {
      const answers = quiz.userAnswers || {};
      const answeredQuestions = Object.values(answers).filter(a => typeof a.isCorrect === 'boolean');
      totalAnswered += answeredQuestions.length;
      totalCorrect += answeredQuestions.filter(a => a.isCorrect === true).length;
    });
    const totalIncorrect = totalAnswered - totalCorrect;
    const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
    return { totalAnswered, totalCorrect, totalIncorrect, accuracy };
  }, [quizzes]);

  const handleCreateFolder = async (name, parentId = null) => { if (!userId || !name) return; await addDoc(collection(db, "artifacts", appId, "users", userId, "folders"), { name, parentId: parentId, createdAt: serverTimestamp(), isFavorited: false }); };
  const handleDeleteQuiz = async (quizId) => { if (!userId) return; await deleteDoc(doc(db, "artifacts", appId, "users", userId, "quizzes", quizId)); setConfirmDelete(null); };
  const handleRestartQuiz = async (quizId) => {
    if (!userId) return;
    const quizRef = doc(db, "artifacts", appId, "users", userId, "quizzes", quizId);
    try {
      await updateDoc(quizRef, { userAnswers: {}, savedQuestions: [], status: 'not-started' });
    } catch (error) {
      console.error("Error restarting quiz:", error);
    } finally {
      setConfirmRestart(null);
    }
  };
  const handleDeleteFolder = async (folderId) => {
    if (!userId) return;
    const batch = writeBatch(db); const foldersToDelete = new Set([folderId]);
    const findDescendants = (parentId) => { const children = folders.filter(f => f.parentId === parentId); children.forEach(child => { foldersToDelete.add(child.id); findDescendants(child.id); }); };
    findDescendants(folderId);
    if (foldersToDelete.size > 0) { const quizzesQuery = query(collection(db, "artifacts", appId, "users", userId, "quizzes"), where("folderId", "in", Array.from(foldersToDelete))); const quizSnapshots = await getDocs(quizzesQuery); quizSnapshots.forEach(quizDoc => { const quizRef = doc(db, "artifacts", appId, "users", userId, "quizzes", quizDoc.id); batch.update(quizRef, { folderId: null }); }); }
    foldersToDelete.forEach(id => { const folderRef = doc(db, "artifacts", appId, "users", userId, "folders", id); batch.delete(folderRef); });
    await batch.commit(); setConfirmDelete(null);
  };
  const handleSaveName = async (itemId, itemType, newName) => {
    if (!userId) return;
    const collectionName = itemType === 'quiz' ? 'quizzes' : 'folders';
    const fieldName = itemType === 'quiz' ? 'title' : 'name';
    await updateDoc(doc(db, "artifacts", appId, "users", userId, collectionName, itemId), { [fieldName]: newName });
    setEditingItem(null);
  };
  const handleMoveItem = async (itemId, itemType, destinationFolderId) => {
    if (!userId) return;
    const collectionName = itemType === 'quiz' ? 'quizzes' : 'folders';
    const fieldName = itemType === 'quiz' ? 'folderId' : 'parentId';
    await updateDoc(doc(db, "artifacts", appId, "users", userId, collectionName, itemId), { [fieldName]: destinationFolderId });
    setMovingItem(null);
  };
  const handleToggleFavorite = async (itemId, itemType, currentStatus) => {
    if (!userId) return;
    const collectionName = itemType === 'quiz' ? 'quizzes' : 'folders';
    await updateDoc(doc(db, "artifacts", appId, "users", userId, collectionName, itemId), { isFavorited: !currentStatus });
  };
  const categorizedQuizzesByStatus = useMemo(() => { const categories = { 'in-progress': [], 'not-started': [], 'completed': [] }; quizzes.forEach(quiz => { const status = getStatus(quiz); categories[status].push(quiz); }); return categories; }, [quizzes, getStatus]);
  const folderTree = useMemo(() => { const tree = []; const map = {}; folders.forEach(folder => { map[folder.id] = { ...folder, children: [] }; }); folders.forEach(folder => { if (folder.parentId && map[folder.parentId]) { map[folder.parentId].children.push(map[folder.id]); } else { tree.push(map[folder.id]); } }); return tree; }, [folders]);
  const displayedFolders = useMemo(() => folders.filter(f => (f.parentId || null) === currentFolderId).sort((a, b) => (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0) || a.name.localeCompare(b.name)), [folders, currentFolderId]);
  const displayedQuizzes = useMemo(() => quizzes.filter(q => (q.folderId || null) === currentFolderId).sort((a, b) => (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0) || (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [quizzes, currentFolderId]);

  const Breadcrumbs = ({ path, onNavigate }) => (
    <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap">
        {path.map((crumb, index) => (
          <li key={crumb.id || 'root'} className="inline-flex items-center">
            {index > 0 && (<ChevronRight size={16} className="mx-1 text-gray-400" />)}
            {index < path.length - 1 ? (
              <button onClick={() => onNavigate(crumb.id, index)} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {crumb.name}
              </button>
            ) : (
              <span className="text-gray-800 dark:text-white font-semibold">{crumb.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );

  const FolderCard = ({ folder, onNavigate, onDelete, onRename, onMove, onAddSubfolder, onAddQuiz, onToggleFavorite }) => {
    const subfoldersCount = useMemo(() => folders.filter(f => f.parentId === folder.id).length, [folders, folder.id]);
    const quizzesCount = useMemo(() => quizzes.filter(q => q.folderId === folder.id).length, [quizzes, folder.id]);
    const itemCount = subfoldersCount + quizzesCount;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);
    return (
      <div className="group relative flex flex-col justify-between p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/80 hover:-translate-y-1 transition-all duration-300 h-full">
        <button onClick={() => onToggleFavorite(folder.id, 'folder', folder.isFavorited)} className="absolute top-2 right-2 p-1 z-10 text-gray-400 hover:text-yellow-400">
          <Star size={18} className={`transition-colors ${folder.isFavorited ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
        </button>
        <button onClick={() => onNavigate(folder)} className="flex-grow text-left">
          <Folder size={40} className="text-yellow-500 mb-2" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white h-12 leading-tight">{folder.name}</h3>
        </button>
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(o => !o)} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700">
                <button onClick={() => { onAddQuiz(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"><PlusCircle size={16}/> Nova Lista</button>
                <button onClick={() => { onAddSubfolder(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"><FolderPlus size={16}/> Nova Subpasta</button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button onClick={() => { onRename(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"><Edit size={16}/> Renomear</button>
                <button onClick={() => { onMove(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"><FolderInput size={16}/> Mover</button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"><Trash2 size={16}/> Excluir Pasta</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const QuizListItem = ({ quiz, onSelectQuiz, onViewHistory, onRestart, onDelete, onEdit, onMove, onToggleFavorite, isDark }) => {
    const totalCount = quiz.quizData?.length || 0;
    const { answersCount, correctCount, incorrectCount } = useMemo(() => {
      const userAnswers = quiz.userAnswers || {};
      let c = 0;
      let a = 0;
      Object.values(userAnswers).forEach(ans => {
        if (typeof ans.isCorrect === 'boolean') {
          a++;
          if (ans.isCorrect) {
            c++;
          }
        }
      });
      const i = a - c;
      return { answersCount: a, correctCount: c, incorrectCount: i };
    }, [quiz.userAnswers]);
    const savedCount = quiz.savedQuestions?.length || 0;
    const status = getStatus(quiz);
    const isCompleted = status === 'completed';
    const createdAtDate = quiz.createdAt ? new Date(quiz.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : '';
    const accuracy = answersCount > 0 ? (correctCount / answersCount) * 100 : 0;
    const sourceInfo = useMemo(() => {
      if (quiz.sourceType === 'saved') return { type: 'Compilado de Questões Salvas', icon: Bookmark, details: '', color: 'text-yellow-500 dark:text-yellow-400' };
      if (quiz.title?.startsWith('Conversão:')) return { type: 'Conversão de Arquivo', icon: Wand2, details: quiz.sourceFile?.name || 'Nome do arquivo não salvo', color: 'text-purple-500 dark:text-purple-400' };
      if (quiz.sourceFile) return { type: 'Gerado de Arquivo(s)', icon: FileText, details: Array.isArray(quiz.sourceFile) ? quiz.sourceFile.map(f => f.name).join(', ') : quiz.sourceFile.name, color: 'text-blue-500 dark:text-blue-400' };
      return { type: 'Gerado por Tema', icon: Lightbulb, details: quiz.title, color: 'text-green-500 dark:text-green-400' };
    }, [quiz]);
    const SourceIcon = sourceInfo.icon;
    const hasHistory = quiz.customInstructionsHistory && quiz.customInstructionsHistory.length > 0;
    const statusText = { 'not-started': 'Iniciar', 'in-progress': 'Continuar', 'completed': 'Revisar' }[status];

    return (
      <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-5 rounded-2xl shadow-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${isCompleted ? 'border-green-400/50 dark:border-green-500/40 opacity-80 hover:opacity-100' : 'border-gray-200/80 dark:border-gray-700/50'}`}>
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-1.5">
            <button onClick={() => onToggleFavorite(quiz.id, 'quiz', quiz.isFavorited)} title="Favoritar">
              <Star size={20} className={`transition-colors ${quiz.isFavorited ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{quiz.title}</h3>
            {isCompleted && (
              <div className="flex items-center gap-1 text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-500/20 px-2 py-0.5 rounded-full text-xs font-bold">
                <CheckCircle size={14} />
                <span>CONCLUÍDO</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-3 pl-10">
            <span>{totalCount} Questões</span>
            {status !== 'not-started' && (<><span className="text-green-600 dark:text-green-400 font-semibold">{correctCount} Corretas ({accuracy.toFixed(0)}%)</span><span className="text-red-600 dark:text-red-400 font-semibold">{incorrectCount} Incorretas</span></>)}
            {savedCount > 0 && (<span className="text-yellow-600 dark:text-yellow-400 font-semibold flex items-center gap-1"><Bookmark size={14}/> {savedCount} Salvas</span>)}
            <span className="flex items-center gap-1"><Clock size={14}/> {createdAtDate}</span>
          </div>
          <div className="flex flex-col gap-2 text-xs text-gray-500 dark:text-gray-400 pl-10">
            <div className="flex items-center gap-2"><SourceIcon className={sourceInfo.color} size={16} /><span>{sourceInfo.type}: <span className="font-medium text-gray-600 dark:text-gray-300">{sourceInfo.details}</span></span></div>
            {hasHistory && (<button onClick={onViewHistory} className="flex items-center gap-2 hover:text-blue-500 transition-colors text-left"><Sparkles className="text-purple-500 dark:text-purple-400" size={16} /><span>Personalização aplicada. <span className="underline">Clique para ver</span>.</span></button>)}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
          <button onClick={() => onSelectQuiz(quiz)} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition-colors">{statusText}</button>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} title="Renomear" className="p-2 rounded-lg bg-gray-200/70 dark:bg-gray-700/70 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><Edit size={18}/></button>
            <button onClick={onMove} title="Mover" className="p-2 rounded-lg bg-gray-200/70 dark:bg-gray-700/70 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><FolderInput size={18}/></button>
            {status !== 'not-started' && <button onClick={onRestart} title="Reiniciar" className="p-2 rounded-lg bg-gray-200/70 dark:bg-gray-700/70 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><RotateCw size={18}/></button>}
            <button onClick={onDelete} title="Excluir" className="p-2 rounded-lg bg-red-500/20 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 dark:hover:bg-red-500/30 transition-colors"><Trash2 size={18}/></button>
          </div>
        </div>
      </div>
    );
  };

  const renderStatusView = () => (
    <div className="mt-6">
      {Object.entries(categorizedQuizzesByStatus).map(([status, list]) => {
        const info = { 'in-progress': { title: 'Em Progresso', icon: Edit }, 'not-started': { title: 'Não Iniciadas', icon: Play }, 'completed': { title: 'Concluídas', icon: CheckCircle } }[status];
        const sortedList = list.sort((a, b) => (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0) || (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        return (<div key={status} className="mb-10"><h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}><info.icon className="text-blue-500 dark:text-blue-400" /> {info.title}</h2>{sortedList.length > 0 ? (<div className="space-y-4">{sortedList.map(quiz => <QuizListItem key={quiz.id} quiz={quiz} isDark={isDark} onSelectQuiz={() => onSelectQuiz(quiz)} onViewHistory={() => setViewingInstructions(quiz.customInstructionsHistory)} onRestart={() => setConfirmRestart({id: quiz.id, title: quiz.title})} onDelete={() => setConfirmDelete({ id: quiz.id, type: 'quiz' })} onEdit={() => setEditingItem({id: quiz.id, type: 'quiz', title: quiz.title})} onMove={() => setMovingItem({id: quiz.id, type: 'quiz', title: quiz.title})} onToggleFavorite={handleToggleFavorite}/>)}</div>) : <p className="text-gray-500 dark:text-gray-400 italic ml-8">Nenhuma lista nesta categoria.</p>}</div>);
      })}
    </div>
  );
  
  const renderFoldersView = () => (
    <div className="mt-6">
      <Breadcrumbs path={folderPath} onNavigate={navigateByBreadcrumb} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        <button onClick={() => onStartNewQuiz(currentFolderId)} className="group flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/40 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-dashed border-blue-400 dark:border-blue-600 hover:-translate-y-1 transition-all duration-300 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 h-full min-h-[140px]">
          <PlusCircle size={40} className="mb-2" />
          <h3 className="text-base font-bold text-center">Criar Nova Lista</h3>
        </button>
        <button onClick={() => setCreateFolderState({ isOpen: true, parentId: currentFolderId })} className="group flex flex-col items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/40 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-dashed border-yellow-400 dark:border-yellow-600 hover:-translate-y-1 transition-all duration-300 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/60 h-full min-h-[140px]">
          <FolderPlus size={40} className="mb-2" />
          <h3 className="text-base font-bold text-center">Nova Subpasta</h3>
        </button>
        {displayedFolders.map(folder => (
          <FolderCard key={folder.id} folder={folder} onNavigate={navigateToFolder} onDelete={() => setConfirmDelete({ id: folder.id, type: 'folder' })} onRename={() => setEditingItem({id: folder.id, type: 'folder', title: folder.name})} onMove={() => setMovingItem({id: folder.id, type: 'folder', title: folder.name})} onAddSubfolder={() => setCreateFolderState({ isOpen: true, parentId: folder.id })} onAddQuiz={() => onStartNewQuiz(folder.id)} onToggleFavorite={handleToggleFavorite} />
        ))}
      </div>
      {(displayedFolders.length > 0 && displayedQuizzes.length > 0) && (<hr className="my-8 border-gray-300 dark:border-gray-700" />)}
      {displayedQuizzes.length > 0 && (
        <div className="space-y-4">
          {displayedQuizzes.map(quiz => (
            <QuizListItem key={quiz.id} quiz={quiz} isDark={isDark} onSelectQuiz={() => onSelectQuiz(quiz)} onViewHistory={() => setViewingInstructions(quiz.customInstructionsHistory)} onRestart={() => setConfirmRestart({id: quiz.id, title: quiz.title})} onDelete={() => setConfirmDelete({ id: quiz.id, type: 'quiz' })} onEdit={() => setEditingItem({id: quiz.id, type: 'quiz', title: quiz.title})} onMove={() => setMovingItem({id: quiz.id, type: 'quiz', title: quiz.title})} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}
      {(displayedFolders.length === 0 && displayedQuizzes.length === 0) && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Esta pasta não contém subpastas ou listas.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full p-8 relative overflow-y-auto">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Minhas Listas</h1>
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="bg-gray-200/80 hover:bg-gray-300/90 dark:bg-gray-600/80 dark:hover:bg-gray-500/90 backdrop-blur-md text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">Voltar</button>
            <button onClick={onShowPerformance} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"><TrendingUp size={20} /> Painel de Desempenho</button>
            <button onClick={() => setCreateFolderState({ isOpen: true, parentId: currentFolderId })} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"><FolderPlus size={20} /> Criar Pasta</button>
            <button onClick={() => onStartNewQuiz(currentFolderId)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"><PlusCircle size={20} /> Criar Nova Lista</button>
          </div>
        </div>
        <PerformanceDashboard {...performanceStats} theme={theme} />
        <div className={`bg-gray-200/70 dark:bg-gray-800/70 backdrop-blur-sm p-1 rounded-lg inline-flex mb-6`}>
          <button onClick={() => setViewMode('folders')} className={`px-6 py-2 rounded-md font-semibold transition-colors ${viewMode === 'folders' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-300 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Por Pastas</button>
          <button onClick={() => setViewMode('status')} className={`px-6 py-2 rounded-md font-semibold transition-colors ${viewMode === 'status' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-300 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Por Status</button>
        </div>
        {quizzes.length > 0 || folders.length > 0 ? (viewMode === 'status' ? renderStatusView() : renderFoldersView()) : (<div className="text-center py-20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl mt-6"><Inbox size={64} className="mx-auto text-gray-400 mb-4" /><h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Nenhuma lista encontrada</h2><p className="text-gray-500 dark:text-gray-400 mb-6">Crie sua primeira lista de questões para começar a estudar!</p><button onClick={() => onStartNewQuiz()} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">Criar minha primeira Lista</button></div>)}
      </div>
      {confirmDelete && <ConfirmationModal title={`Confirmar Exclusão de ${confirmDelete.type === 'quiz' ? 'Lista' : 'Pasta'}`} message={confirmDelete.type === 'folder' ? 'Tem certeza que deseja apagar esta pasta e todas as suas subpastas?\n\nTodas as listas de questões dentro delas serão movidas para "Listas Soltas". Esta ação não pode ser desfeita.' : 'Tem certeza que deseja apagar esta lista? Esta ação não pode ser desfeita.'} onConfirm={() => confirmDelete.type === 'quiz' ? handleDeleteQuiz(confirmDelete.id) : handleDeleteFolder(confirmDelete.id)} onCancel={() => setConfirmDelete(null)} />}
      {confirmRestart && <ConfirmationModal title="Confirmar Reinício da Lista" message={`Tem certeza que deseja reiniciar a lista "${confirmRestart.title}"?\n\nTodo o seu progresso (respostas e questões salvas) será permanentemente apagado.`} onConfirm={() => handleRestartQuiz(confirmRestart.id)} onCancel={() => setConfirmRestart(null)} />}
      {editingItem && <EditItemNameModal item={editingItem} onSave={(newName) => handleSaveName(editingItem.id, editingItem.type, newName)} onClose={() => setEditingItem(null)} />}
      {movingItem && <MoveItemModal itemToMove={movingItem} folders={folders} folderTree={folderTree} onMove={(destinationId) => handleMoveItem(movingItem.id, movingItem.type, destinationId)} onClose={() => setMovingItem(null)} />}
      {createFolderState.isOpen && <CreateFolderModal onSave={handleCreateFolder} onClose={() => setCreateFolderState({ isOpen: false, parentId: null })} parentId={createFolderState.parentId} />}
      {viewingInstructions && <InstructionsModal history={viewingInstructions} onClose={() => setViewingInstructions(null)} />}
    </div>
  );
};

const DonutChart = ({ percentage, size = 100, strokeWidth = 12, color = 'text-blue-500' }) => {
  const radius = (size - strokeWidth) / 2; const circumference = 2 * Math.PI * radius; const offset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <circle className="text-gray-300 dark:text-gray-700" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle className={`${color} transition-all duration-1000 ease-out`} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2} style={{ strokeDasharray: circumference, strokeDashoffset: offset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold">{`${Math.round(percentage)}%`}</span></div>
    </div>
  );
};

const GlobalPerformanceDashboard = ({ user, theme, onBack, appId }) => {
  const [quizzes, setQuizzes] = useState([]); const [folders, setFolders] = useState([]); const [isLoading, setIsLoading] = useState(true); const [expandedFolders, setExpandedFolders] = useState({});
  const userId = user?.uid;
  const isDark = ['dark', 'graphite', 'gray'].includes(theme);

  useEffect(() => {
    if (!userId) return;
    const quizzesQuery = query(collection(db, "artifacts", appId, "users", userId, "quizzes")); const foldersQuery = query(collection(db, "artifacts", appId, "users", userId, "folders"));
    const unsubQuizzes = onSnapshot(quizzesQuery, (querySnapshot) => { const quizzesData = []; querySnapshot.forEach((doc) => quizzesData.push({ id: doc.id, ...doc.data() })); setQuizzes(quizzesData); });
    const unsubFolders = onSnapshot(foldersQuery, (querySnapshot) => { const foldersData = []; querySnapshot.forEach((doc) => foldersData.push({ id: doc.id, ...doc.data() })); foldersData.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)); setFolders(foldersData); setIsLoading(false); });
    return () => { unsubQuizzes(); unsubFolders(); };
  }, [userId, appId]);

  const { folderStats, overallStats, folderTree } = useMemo(() => {
    const statsCache = new Map();
    const childrenMap = folders.reduce((acc, folder) => { const parentId = folder.parentId || 'root'; if (!acc[parentId]) acc[parentId] = []; acc[parentId].push(folder.id); return acc; }, {});
    const quizzesByFolderId = quizzes.reduce((acc, quiz) => { const folderId = quiz.folderId || 'root'; if (!acc[folderId]) acc[folderId] = []; acc[folderId].push(quiz); return acc; }, {});

    const calculateStatsForFolder = (folderId) => {
      if (statsCache.has(folderId)) return statsCache.get(folderId);
      let stats = { totalQuizzes: 0, totalQuestions: 0, totalAnswered: 0, totalCorrect: 0 };
      const directQuizzes = quizzesByFolderId[folderId] || [];
      stats.totalQuizzes += directQuizzes.length;
      directQuizzes.forEach(quiz => {
        stats.totalQuestions += quiz.quizData?.length || 0;
        const answers = quiz.userAnswers || {};
        const answeredQuestions = Object.values(answers).filter(a => typeof a.isCorrect === 'boolean');
        stats.totalAnswered += answeredQuestions.length;
        stats.totalCorrect += answeredQuestions.filter(a => a.isCorrect === true).length;
      });
      const childFolderIds = childrenMap[folderId] || [];
      childFolderIds.forEach(childId => {
        const childStats = calculateStatsForFolder(childId);
        stats.totalQuizzes += childStats.totalQuizzes;
        stats.totalQuestions += childStats.totalQuestions;
        stats.totalAnswered += childStats.totalAnswered;
        stats.totalCorrect += childStats.totalCorrect;
      });
      statsCache.set(folderId, stats);
      return stats;
    };
    folders.forEach(folder => calculateStatsForFolder(folder.id));
    calculateStatsForFolder('root');
    const tree = []; const map = {}; folders.forEach(folder => map[folder.id] = { ...folder, children: [] }); folders.forEach(folder => { if (folder.parentId && map[folder.parentId]) map[folder.parentId].children.push(map[folder.id]); else tree.push(map[folder.id]); });
    let totalAnswered = 0; let totalCorrect = 0; let totalQuestions = 0;
    quizzes.forEach(quiz => {
      const answers = quiz.userAnswers || {};
      const answeredQuestions = Object.values(answers).filter(a => typeof a.isCorrect === 'boolean');
      totalAnswered += answeredQuestions.length;
      totalCorrect += answeredQuestions.filter(a => a.isCorrect === true).length;
      totalQuestions += quiz.quizData?.length || 0;
    });
    const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
    return { folderStats: statsCache, overallStats: { totalQuizzes: quizzes.length, totalQuestions, totalAnswered, totalCorrect, accuracy }, folderTree: tree };
  }, [quizzes, folders]);

  const toggleFolder = (folderId) => setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));

  const FolderPerformanceCard = ({ folder, stats, level = 0 }) => {
    const accuracy = stats.totalAnswered > 0 ? (stats.totalCorrect / stats.totalAnswered) * 100 : 0;
    const accuracyColor = accuracy >= 70 ? 'text-green-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500';
    return (
      <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-5 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-lg ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ marginLeft: `${level * 2}rem` }}>
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleFolder(folder.id)}>
          <DonutChart percentage={accuracy} size={80} strokeWidth={10} color={accuracyColor} />
          <div className="flex-grow"><h3 className="text-xl font-bold truncate">{folder.name}</h3><div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1"><span>{stats.totalQuizzes} Listas</span><span>{stats.totalQuestions} Questões</span></div></div>
          <ChevronDown className={`transition-transform flex-shrink-0 ${expandedFolders[folder.id] ? 'rotate-180' : ''}`} />
        </div>
        {expandedFolders[folder.id] && folder.children.length > 0 && (<div className="mt-4 space-y-3">{folder.children.map(child => { const childStats = folderStats.get(child.id); return childStats ? <FolderPerformanceCard key={child.id} folder={child} stats={childStats} level={level + 1} /> : null; })}</div>)}
      </div>
    );
  };
  if (isLoading) { return <div className="w-full h-full flex items-center justify-center"><Spinner /></div>; }
  return (
    <div className={`w-full h-full p-8 relative overflow-y-auto ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8"><h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Painel de Desempenho</h1><button onClick={onBack} className={`bg-gray-200/80 hover:bg-gray-300/90 dark:bg-gray-600/80 dark:hover:bg-gray-500/90 backdrop-blur-md font-bold py-2 px-6 rounded-lg transition-colors ${isDark ? 'text-white' : 'text-gray-800'}`}>Voltar</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-100/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 dark:border-white/10"><p className="text-sm text-gray-600 dark:text-gray-400">Total de Listas</p><p className="text-4xl font-bold">{overallStats.totalQuizzes}</p></div>
          <div className="bg-gray-100/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 dark:border-white/10"><p className="text-sm text-gray-600 dark:text-gray-400">Total de Questões</p><p className="text-4xl font-bold">{overallStats.totalQuestions}</p></div>
          <div className="bg-gray-100/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 dark:border-white/10"><p className="text-sm text-gray-600 dark:text-gray-400">Questões Resolvidas</p><p className="text-4xl font-bold">{overallStats.totalAnswered}</p></div>
          <div className="bg-gray-100/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 dark:border-white/10"><p className="text-sm text-gray-600 dark:text-gray-400">Precisão Geral</p><p className="text-4xl font-bold text-green-500 dark:text-green-400">{overallStats.accuracy.toFixed(1)}%</p></div>
        </div>
        <h2 className="text-3xl font-bold mb-6">Desempenho por Pastas</h2>
        {folders.length > 0 ? (<div className="space-y-4">{folderTree.map(folder => { const stats = folderStats.get(folder.id); return stats ? <FolderPerformanceCard key={folder.id} folder={folder} stats={stats} /> : null; })}</div>) : (<div className="text-center py-20 bg-gray-100/70 dark:bg-white/5 backdrop-blur-md rounded-xl mt-6"><Folder size={64} className="mx-auto text-gray-500 mb-4" /><h2 className="text-2xl font-bold mb-2">Nenhuma pasta encontrada</h2><p className="text-gray-500 dark:text-gray-400">Crie pastas e organize suas listas para ver seu desempenho aqui.</p></div>)}
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DO APLICATIVO ---
export default function App() {
  const [theme, setTheme] = useState('dark');
  const [previewTheme, setPreviewTheme] = useState('dark');
  const [screen, setScreen] = useState('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [quizSource, setQuizSource] = useState({ content: null, type: '' });
  const [questionOrder, setQuestionOrder] = useState('mixed');
  const [customInstructions, setCustomInstructions] = useState('');
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });
  const [requestAddConverted, setRequestAddConverted] = useState(null);
  const [isPdfJsLoaded, setIsPdfJsLoaded] = useState(false);
  const [isMammothLoaded, setIsMammothLoaded] = useState(false);
  const [addMoreOptions, setAddMoreOptions] = useState({ show: false, quiz: null });
  const [targetFolderId, setTargetFolderId] = useState(null);
  const appId = 'mgq-app-v1'; 

  useEffect(() => {
    const checkLibs = () => {
      if (window.pdfjsLib && !isPdfJsLoaded) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs";
          setIsPdfJsLoaded(true);
      }
      if (window.mammoth && !isMammothLoaded) {
          setIsMammothLoaded(true);
      }
    };
    
    checkLibs();
    const intervalId = setInterval(() => {
      checkLibs();
      if(isPdfJsLoaded && isMammothLoaded) {
        clearInterval(intervalId);
      }
    }, 200);

    const timeoutId = setTimeout(() => clearInterval(intervalId), 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isPdfJsLoaded, isMammothLoaded]);

  useEffect(() => {
    let hasInitialized = false;
    const initializeAppLogic = () => {
      if (hasInitialized) return;
      hasInitialized = true;
      try {
        const savedTheme = localStorage.getItem('quizTheme') || 'dark';
        setTheme(savedTheme);
        setPreviewTheme(savedTheme);
        document.documentElement.classList.toggle('dark', ['dark', 'graphite', 'gray'].includes(savedTheme));

        if (firebaseInitializationError) {
          throw new Error(firebaseInitializationError);
        }
        
        const initialScreen = localStorage.getItem('quizTheme') ? 'quizList' : 'welcome';
        setScreen(initialScreen);
        setIsInitialized(true);

        onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
          } else {
            try {
              const userCredential = await signInAnonymously(auth);
              setUser(userCredential.user);
            } catch (authError) {
              console.error("Erro no login anônimo:", authError);
              setError("Não foi possível iniciar uma sessão. Verifique sua conexão e as regras do Firebase.");
            }
          }
        });
      } catch (e) {
        console.error("Erro de inicialização:", e);
        setError(e.message);
        setIsInitialized(true);
      }
    };
    initializeAppLogic();
  }, []);

  const handlePreviewTheme = (selectedTheme) => {
    setPreviewTheme(selectedTheme);
    document.documentElement.classList.toggle('dark', ['dark', 'graphite', 'gray'].includes(selectedTheme));
  };
  
  const handleConfirmTheme = () => {
    setTheme(previewTheme);
    localStorage.setItem('quizTheme', previewTheme);
    setScreen('quizList');
  };

  const handleBackFromThemeSelection = () => {
    handlePreviewTheme(theme);
    setScreen('welcome');
  };

  const handleFilesProcessed = (files) => { setQuizSource({ content: files, type: 'file', title: files.map(f => f.name).join(', ') }); if (files.length > 1) { setScreen('fileOrder'); } else { setScreen('customization'); } };
  const handleFileOrderSelect = (order) => { setQuestionOrder(order); setScreen('customization'); };
  const handleTopicSubmit = (topic) => { setQuizSource({ content: [{ name: 'Tópico', pages: [{ page: 1, text: topic }] }], type: 'topic', title: topic }); setCustomInstructions(''); setScreen('questionCountInput'); };
  const handleContinueWithPreferences = (preferences) => { setCustomInstructions(preferences); setScreen('questionCountInput'); };
  const handleContinueWithoutPreferences = () => { setCustomInstructions(''); setScreen('questionCountInput'); };
  const handleStartNewQuiz = (folderId = null) => { setTargetFolderId(folderId); setScreen('sourceSelection'); };
  const handleFileProcessedForConversion = (processedFile) => { setQuizSource({ content: processedFile, type: 'converter', title: `Conversão: ${processedFile.name}` }); setScreen('conversionQuestionCount'); };

  const formatQuizSourceForPrompt = (source, order) => {
    if (!source || !source.content) return '';
    if (source.type === 'converter') { return source.content.pages.map(p => `[Página: ${p.page}]: ${p.text}`).join('\n\n'); }
    if (source.type === 'file' && Array.isArray(source.content)) { let allPages = source.content.flatMap(file => file.pages.map(page => ({ text: `[Arquivo: ${file.name}, Página: ${page.page}]: ${page.text}` }))); if (order === 'mixed') { allPages = shuffleArray(allPages); } return allPages.map(p => p.text).join('\n\n'); }
    if (source.type === 'topic' && source.content[0]?.pages[0]?.text) { return source.content[0].pages[0].text; }
    return '';
  };
  
// Inserir a função fetchWithRetry aqui
const fetchWithRetry = async (url, options, maxRetries = 3, initialDelay = 1000) => {
  let retryCount = 0;
  let delay = initialDelay;
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      // Se não for erro 503, retorna a resposta
      if (response.status !== 503) {
        return response;
      }
      
      // Se for 503, incrementa contador e espera
      retryCount++;
      console.log(`Tentativa ${retryCount} de ${maxRetries}. Aguardando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Backoff exponencial
      
    } catch (error) {
      // Se for erro de rede, também tenta novamente
      retryCount++;
      console.log(`Erro de rede na tentativa ${retryCount} de ${maxRetries}. Aguardando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  
  // Se esgotou as tentativas, retorna a última resposta
  return fetch(url, options);
};

  const callApiSecurely = async (prompt, schema) => {
    // Inserir a função fetchWithRetry aqui
const fetchWithRetry = async (url, options, maxRetries = 3, initialDelay = 1000) => {
  let retryCount = 0;
  let delay = initialDelay;
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      // Se não for erro 503, retorna a resposta
      if (response.status !== 503) {
        return response;
      }
      
      // Se for 503, incrementa contador e espera
      retryCount++;
      console.log(`Tentativa ${retryCount} de ${maxRetries}. Aguardando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Backoff exponencial
      
    } catch (error) {
      // Se for erro de rede, também tenta novamente
      retryCount++;
      console.log(`Erro de rede na tentativa ${retryCount} de ${maxRetries}. Aguardando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  
  // Se esgotou as tentativas, retorna a última resposta
  return fetch(url, options);
};

const callApiSecurely = async (prompt, schema) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000); // 9 segundos (menos que 10s da Vercel)
  
  try {
    const response = await fetchWithRetry('/api/generateQuiz', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, schema }),
        signal: controller.signal
    }, 3, 1000); // 3 tentativas com 1 segundo de delay inicial
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Body:", errorBody);
        let errorJson;
        try {
            errorJson = JSON.parse(errorBody);
        } catch(e) {
            throw new Error(`A chamada à API falhou: ${response.status} - ${errorBody}`);
        }
        
        // Melhor tratamento do erro 503
        if (response.status === 503) {
          throw new Error("O serviço está temporariamente sobrecarregado. Por favor, tente novamente em alguns minutos.");
        }
        
        const blockReason = errorJson.details?.promptFeedback?.blockReason || "Motivo desconhecido";
        if (errorJson.details?.promptFeedback?.blockReason) {
             throw new Error(`A geração de conteúdo foi bloqueada. Motivo: ${blockReason}.`);
        }
        throw new Error(errorJson.error || `A chamada à API falhou: ${response.status}.`);
    }
    
    const result = await response.json();
    
    if (!result.candidates || result.candidates.length === 0) {
        throw new Error("A API não retornou candidatos válidos.");
    }
    const textResponse = result.candidates[0]?.content?.parts?.[0]?.text;
    if (!textResponse) { 
        throw new Error("A API retornou uma resposta vazia ou em formato inválido."); 
    }
    try {
        return JSON.parse(textResponse);
    } catch (e) {
        console.error("Falha ao analisar JSON da API:", textResponse);
        throw new Error("Erro ao analisar a resposta do servidor.");
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("A requisição excedeu o tempo limite. Por favor, tente novamente.");
    }
    throw error;
  }
};

const response = await fetch('/api/generateQuiz', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
        body: JSON.stringify({ prompt, schema })
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Body:", errorBody);
        let errorJson;
        try {
            errorJson = JSON.parse(errorBody);
        } catch(e) {
            throw new Error(`A chamada à API falhou: ${response.status} - ${errorBody}`);
        }
        const blockReason = errorJson.details?.promptFeedback?.blockReason || "Motivo desconhecido";
        if (errorJson.details?.promptFeedback?.blockReason) {
             throw new Error(`A geração de conteúdo foi bloqueada. Motivo: ${blockReason}.`);
        }
        throw new Error(errorJson.error || `A chamada à API falhou: ${response.status}.`);
    }
    
    const result = await response.json();
    
    if (!result.candidates || result.candidates.length === 0) {
        throw new Error("A API não retornou candidatos válidos.");
    }
    const textResponse = result.candidates[0]?.content?.parts?.[0]?.text;
    if (!textResponse) { throw new Error("A API retornou uma resposta vazia ou em formato inválido."); }
    try {
        return JSON.parse(textResponse);
    } catch (e) {
        console.error("Falha ao analisar JSON da API:", textResponse);
        throw new Error("Erro ao analisar a resposta do servidor.");
    }
  };

  const callGeminiForQuiz = async (prompt) => {
    const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { "topic": { "type": "STRING" }, "question": { "type": "STRING" }, "options": { type: "ARRAY", items: { type: "OBJECT", properties: { "text": { "type": "STRING" }, "isCorrect": { "type": "BOOLEAN" }, "explanation": { "type": "STRING" } }, required: ["text", "isCorrect", "explanation"] } }, "guideline": { "type": "STRING" } }, required: ["topic", "question", "options"] } };
    return callApiSecurely(prompt, schema);
  };
  
  const generateQuizInBatches = async (source, order, instructions, totalCount, existingQuestions = []) => {
    const BATCH_SIZE = 10;
    const numBatches = Math.ceil(totalCount / BATCH_SIZE);
    let newlyGeneratedQuestions = [];
    for (let i = 0; i < numBatches; i++) {
      const batchCount = Math.min(BATCH_SIZE, totalCount - newlyGeneratedQuestions.length);
      if (batchCount <= 0) break;
      setLoadingText(`Gerando seu quiz... (Lote ${i + 1} de ${numBatches})`);
      const progress = Math.round(((i * BATCH_SIZE + batchCount) / totalCount) * 100);
      setGenerationProgress(progress);
      const allKnownQuestions = [...existingQuestions, ...newlyGeneratedQuestions];
      const formattedContent = formatQuizSourceForPrompt(source, order);
      
      let basePrompt;
      if (instructions) {
        basePrompt = `Você é um especialista em criação de quizzes. Usando o texto de referência fornecido, sua principal tarefa é seguir estas instruções específicas para criar ${batchCount} questões: "${instructions}". O texto de referência é: "${formattedContent}".`;
      } else {
        basePrompt = `Você é um especialista em criação de quizzes. Baseado no seguinte tópico ou texto, crie um quiz com ${batchCount} questões: "${formattedContent}".`;
      }
      if (allKnownQuestions.length > 0) {
        const existingQuestionsSummary = allKnownQuestions.map(q => q.question).join('; ');
        basePrompt += `\n\nREGRAS CRÍTICAS: As questões geradas DEVEM ser completamente novas e distintas das que já existem. NÃO gere questões idênticas, nem variações muito próximas, das seguintes questões: "${existingQuestionsSummary}". Verifique cuidadosamente para evitar qualquer repetição.`;
      }
      let rulesPrompt = `Se o tema for relacionado à medicina, foque em aspectos clínicos, fisiopatológicos e farmacológicos relevantes para estudantes e profissionais. As informações devem ser confiáveis e corretas, certifique-se disso, buscando apresentar as fontes das informações (preferencialmente artigos científicos, livros didáticos e diretrizes de sociedades médicas brasileiras ou internacionais. Sempre cite a fonte da informação e onde o usuário pode acessá-la). Se o tema não for relacionado à Medicina, garanta ao máximo a confiabilidade das informações prestadas e esforce-se para mostrar uma fonte real e correta, correspondente ao tema solicitado, mostrando também onde o usuário pode acessar essa fonte para verificar a veracidade das informações.`;
      if (source.type === 'file') {
        rulesPrompt += `O texto fornecido está formatado com o nome do arquivo e o número da página de onde foi extraído (ex: [Arquivo: nome.pdf, Página: X]: texto...). Ao gerar a questão, no campo 'guideline', SEMPRE cite o nome do arquivo e o número da página de onde a informação foi retirada no formato "Fonte: Página X do arquivo nome.pdf."`;
      }
      if (source.type === 'topic') {
        rulesPrompt += `Se o tema solicitado pelo usuário envolver pesquisa em arquivos de leis, como números de artigos de leis, códigos de legislação e coisas do tipo, ou seja, temas que envolvem informações extremamente específicas, tome o máximo de cuidado possível para não trazer informações erradas ou inacuradas. Apenas mostre uma informação se houver uma concordância completa da mesma em diferentes fontes técnicas de consulta ATUALIZADAS (escolha a que tiver o ano de publicação mais próximo de 2025). Para exemplificar o que eu quero dizer: se não houver uma concordância e certeza sobre se uma informação está presente no Art. 51 ou Art. 64 de um determinado código de legislação, não cite esse número. Especifique ao máximo a fonte de tal informação, mas, quando houver dúvida sobre o número de uma lei ou artigo, não coloque. Novamente, traga apenas as informações que você tenha certeza de que estão 100% corretas e atualizadas.`;
      }
      let formatPrompt = `Para cada questão, forneça o seguinte em formato JSON: 'topic', 'question', 'guideline' (opcional, uma referência), e um array 'options'. O array 'options' deve conter 4 objetos. Cada objeto de opção deve ter: 'text' (o texto da alternativa), 'isCorrect' (um booleano, true para a única alternativa correta, false para as outras), e 'explanation' (uma explicação detalhada do porquê a alternativa é correta ou incorreta). É crucial que a 'explanation' em cada objeto de opção corresponda diretamente ao 'text' desse mesmo objeto, explicando por que essa alternativa específica está correta ou incorreta.`;
      
      let finalPrompt = `${basePrompt} ${rulesPrompt} ${formatPrompt}`;
      const batchData = await callGeminiForQuiz(finalPrompt);
      if (Array.isArray(batchData)) {
        const validQuestions = batchData
          .filter(q => q && q.question && Array.isArray(q.options) && q.options.length > 0 && q.options.some(opt => opt.isCorrect === true))
          .map(q => ({ ...q, id: generateSimpleUUID() }));
        newlyGeneratedQuestions.push(...validQuestions);
      }
    }
    return newlyGeneratedQuestions;
  };
  
  const generateAndSaveQuiz = async (count) => {
    setIsLoading(true); setGenerationProgress(0); setError('');
    try {
      const newQuestions = await generateQuizInBatches(quizSource, questionOrder, customInstructions, count);
      if (Array.isArray(newQuestions) && newQuestions.length > 0) {
        const shuffledData = newQuestions.map(q => ({ ...q, options: shuffleArray(q.options) }));
        const quizzesColRef = collection(db, "artifacts", appId, "users", user.uid, "quizzes");
        
        const instructionsHistory = [];
        if (customInstructions) {
          instructionsHistory.push({ instructions: customInstructions, timestamp: new Date() });
        }
        const newQuizDoc = await addDoc(quizzesColRef, { 
          title: quizSource.title, 
          createdAt: serverTimestamp(), 
          status: 'not-started', 
          quizData: shuffledData, 
          userAnswers: {}, 
          savedQuestions: [], 
          isFavorited: false,
          folderId: targetFolderId, 
          customInstructionsHistory: instructionsHistory,
          sourceFile: quizSource.type === 'file' ? quizSource.content : null 
        });
        const newQuizData = { 
          quizData: shuffledData, 
          userAnswers: {}, 
          savedQuestions: [], 
          isFavorited: false,
          title: quizSource.title, 
          customInstructionsHistory: instructionsHistory,
          folderId: targetFolderId, 
          sourceFile: quizSource.type === 'file' ? quizSource.content : null 
        };
        setActiveQuiz({ id: newQuizDoc.id, data: newQuizData });
        setScreen('quiz');
      } else { throw new Error("A API não retornou dados válidos."); }
    } catch (err) { console.error("Erro ao gerar quiz:", err); setError(`Falha ao gerar o quiz. ${err.message}. Tente novamente.`); setScreen('quizList'); } 
    finally { setIsLoading(false); setTargetFolderId(null); }
  };
  
  const handleAddMoreGeneratedQuestions = async (quiz, count, instructions) => {
    setIsLoading(true); setGenerationProgress(0); setError('');
    try {
      const sourceForPrompt = { content: quiz.data.sourceFile || [{ name: 'Tópico', pages: [{ page: 1, text: quiz.data.title }] }], type: quiz.data.sourceFile ? 'file' : 'topic' };
      const existingQuestions = quiz.data.quizData || [];
      const newQuestions = await generateQuizInBatches(sourceForPrompt, 'mixed', instructions, count, existingQuestions);
      if (newQuestions.length > 0) {
        const updatedQuizData = [...existingQuestions, ...newQuestions.map(q => ({...q, options: shuffleArray(q.options)}))];
        const quizRef = doc(db, "artifacts", appId, "users", user.uid, "quizzes", quiz.id);
        
        const newInstructionEntry = { instructions: instructions, timestamp: new Date() };
        await updateDoc(quizRef, { 
          quizData: updatedQuizData, 
          status: 'in-progress', 
          customInstructionsHistory: arrayUnion(newInstructionEntry)
        });
        const updatedQuizSnap = await getDoc(quizRef);
        setActiveQuiz({ id: updatedQuizSnap.id, data: updatedQuizSnap.data() });
        setScreen('quiz');
      } else { setModalInfo({ show: true, title: "Aviso", message: "Não foi possível gerar novas questões." }); }
    } catch (err) { console.error("Erro ao adicionar questões:", err); setModalInfo({ show: true, title: "Erro", message: `Falha ao adicionar novas questões. ${err.message}`}); } 
    finally { setIsLoading(false); }
  };
  
  const handleStartConversion = async (totalQuestionsToConvert) => {
    setIsLoading(true); setGenerationProgress(0); setLoadingText("Convertendo sua lista de questões..."); setError('');
    try {
      const convertedData = await convertQuizInBatches(quizSource.content, totalQuestionsToConvert);
      if (Array.isArray(convertedData) && convertedData.length > 0) { await saveConvertedQuiz(convertedData, quizSource.content.name); } 
      else { throw new Error("A conversão não retornou nenhuma questão válida."); }
    } catch (err) { console.error("Erro ao converter quiz:", err); setError(`Falha ao converter o quiz. ${err.message}. Tente novamente.`); setScreen('quizList'); } 
    finally { setIsLoading(false); }
  };
  
  const convertQuizInBatches = async (sourceContent, questionsToConvert, existingQuestions = []) => {
    const BATCH_SIZE = 20; const numBatches = Math.ceil(questionsToConvert / BATCH_SIZE); let allNewQuestions = []; const tempSource = { content: sourceContent, type: 'converter' }; const fullText = formatQuizSourceForPrompt(tempSource, 'sequential');
    for (let i = 0; i < numBatches; i++) {
      const currentBatchSize = Math.min(BATCH_SIZE, questionsToConvert - allNewQuestions.length); if (currentBatchSize <= 0) break;
      const startIndex = existingQuestions.length + allNewQuestions.length + 1;
      setLoadingText(`Convertendo questões... (Lote ${i + 1} de ${numBatches})`);
      const progress = Math.round(((i + 1) / numBatches) * 100); setGenerationProgress(progress);
      const batchData = await callGeminiForConversion(fullText, startIndex, currentBatchSize);
      if (Array.isArray(batchData)) { 
        const questionsWithId = batchData.map(q => ({ ...q, id: generateSimpleUUID() }));
        allNewQuestions.push(...questionsWithId);
      }
      if (allNewQuestions.length >= questionsToConvert) { break; }
    }
    return allNewQuestions.slice(0, questionsToConvert);
  };
  
  const callGeminiForConversion = async (fullText, startIndex, count) => {
    const CONVERSION_USER_PROMPT = `Sua tarefa é transcrever questões de um arquivo PDF para o formato de quiz.
Instruções Cruciais:
1. Transcrição Fiel: As questões e alternativas devem ser transcritas EXATAMENTE como estão no arquivo, mantendo a ordem original.
2. Análise do Gabarito: Primeiro, verifique CUIDADOSAMENTE se o arquivo contém um gabarito (lista de respostas corretas).
  - Se um gabarito for encontrado: Utilize-o para marcar a alternativa correta para cada questão.
  - Se NÃO houver gabarito: Você deve resolver cada questão com base em seu próprio conhecimento técnico sobre o assunto, determinar qual é a alternativa correta e marcá-la como \`isCorrect: true\`.
3. Justificativa Completa: Para a alternativa que você marcou como correta (seja pelo gabarito ou por sua própria análise), forneça uma explicação detalhada e útil no campo 'explanation'. Para as alternativas incorretas, deixe o campo 'explanation' como uma string vazia ("").
4. Correção e Formatação: Corrija apenas erros óbvios de formatação ou digitação no texto original para a palavra mais provável, sem alterar o sentido do enunciado ou das alternativas.
5. Referência de Página: Sempre referencie a página do arquivo de onde a questão foi extraída no campo 'guideline'.`;
    const systemPrompt = `Você é um assistente de IA especialista em análise de documentos e criação de conteúdo educacional. Sua tarefa é converter um texto de prova em um formato JSON estruturado, seguindo as instruções do usuário com máxima precisão. A resposta DEVE ser um array JSON de objetos, onde cada objeto representa uma questão e segue este schema: { "topic": "string", "question": "string", "options": [ { "text": "string", "isCorrect": boolean, "explanation": "string" } ], "guideline": "string" }.
Aqui estão as instruções do usuário:
"${CONVERSION_USER_PROMPT}"
Do texto completo fornecido abaixo, processe e transcreva as ${count} questões começando pela questão de número ${startIndex}.
TEXTO COMPLETO:
"${fullText}"`;
    return callGeminiForQuiz(systemPrompt);
  };

  const saveConvertedQuiz = async (questions, fileName) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const convertedData = questions; const quizzesColRef = collection(db, "artifacts", appId, "users", user.uid, "quizzes");
    const newQuizDoc = await addDoc(quizzesColRef, { title: `Conversão: ${fileName}`, createdAt: serverTimestamp(), status: 'not-started', quizData: convertedData, userAnswers: {}, savedQuestions: [], isFavorited: false, folderId: targetFolderId, sourceFile: quizSource.content });
    const newQuizData = { id: newQuizDoc.id, data: { quizData: convertedData, userAnswers: {}, savedQuestions: [], isFavorited: false, title: `Conversão: ${fileName}`, folderId: targetFolderId, sourceFile: quizSource.content }};
    setActiveQuiz(newQuizData); setScreen('quiz');
    setTargetFolderId(null);
  };

  const handleAddMoreConvertedQuestions = async (count) => {
    if (!requestAddConverted) return;
    setIsLoading(true); setGenerationProgress(0); setLoadingText("Adicionando mais questões..."); setError('');
    const quiz = requestAddConverted; const existingQuestions = quiz.data.quizData || []; const sourceFileContent = quiz.data.sourceFile;
    if (!sourceFileContent) { setError("Arquivo fonte original não encontrado. Não é possível adicionar mais questões."); setIsLoading(false); setRequestAddConverted(null); setScreen('quizList'); return; }
    try {
      const newQuestions = await convertQuizInBatches(sourceFileContent, count, existingQuestions);
      const updatedQuizData = [...existingQuestions, ...newQuestions];
      if (updatedQuizData.length > existingQuestions.length) {
        const quizRef = doc(db, "artifacts", appId, "users", user.uid, "quizzes", quiz.id);
        await updateDoc(quizRef, { quizData: updatedQuizData, status: 'in-progress' });
        const updatedQuiz = { ...quiz, data: { ...quiz.data, quizData: updatedQuizData, status: 'in-progress' } };
        setActiveQuiz(updatedQuiz); setScreen('quiz');
      } else { setModalInfo({ show: true, title: "Aviso", message: "Não foi possível adicionar novas questões. Você pode ter chegado ao fim do arquivo." }); setScreen('results'); }
    } catch (err) { console.error("Erro ao adicionar mais questões convertidas:", err); setError(`Falha ao adicionar questões. ${err.message}.`); setScreen('quizList'); } 
    finally { setIsLoading(false); setRequestAddConverted(null); }
  };

  const handleCreateErrorNotebook = async (finishedQuiz) => {
    if (!user || !finishedQuiz) return;
    const { quizData, userAnswers, title: originalTitle } = finishedQuiz.data;
    const incorrectQuestions = quizData.filter((_, index) => {
      const answer = userAnswers[index];
      return answer && !answer.isCorrect;
    });
    if (incorrectQuestions.length === 0) {
      setModalInfo({ show: true, title: "Parabéns!", message: "Você não errou nenhuma questão nesta lista. Não há nada para adicionar ao Caderno de Erros." });
      return;
    }
    setIsLoading(true);
    setLoadingText("Criando seu Caderno de Erros...");
    try {
      const foldersRef = collection(db, "artifacts", appId, "users", user.uid, "folders");
      const q = query(foldersRef, where("name", "==", "Caderno de Erros"));
      const querySnapshot = await getDocs(q);
      let errorFolderId;
      if (querySnapshot.empty) {
        const newFolderDoc = await addDoc(foldersRef, {
          name: "Caderno de Erros",
          parentId: null,
          createdAt: serverTimestamp(),
          isFavorited: true
        });
        errorFolderId = newFolderDoc.id;
      } else {
        errorFolderId = querySnapshot.docs[0].id;
      }
      const newQuizTitle = `Caderno de Erros - ${originalTitle}`;
      const quizzesColRef = collection(db, "artifacts", appId, "users", user.uid, "quizzes");
      await addDoc(quizzesColRef, {
        title: newQuizTitle,
        createdAt: serverTimestamp(),
        status: 'not-started',
        quizData: incorrectQuestions,
        userAnswers: {},
        savedQuestions: [],
        isFavorited: false,
        folderId: errorFolderId,
        sourceQuizId: finishedQuiz.id,
      });
      setModalInfo({ show: true, title: "Sucesso!", message: `Seu "Caderno de Erros" foi criado e adicionado à pasta correspondente.` });
      setScreen('quizList');
    } catch (err) {
      console.error("Erro ao criar caderno de erros:", err);
      setError(`Falha ao criar o Caderno de Erros. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuiz = async (quiz) => {
    const quizRef = doc(db, "artifacts", appId, "users", user.uid, "quizzes", quiz.id);
    const quizSnap = await getDoc(quizRef);
    if (quizSnap.exists()) {
      const fullQuizData = quizSnap.data();
      setActiveQuiz({ id: quiz.id, data: fullQuizData });
      setScreen('quiz');
    } else {
      console.error("Quiz não encontrado no Firestore:", quiz.id);
      setError("Não foi possível carregar o quiz selecionado.");
      setScreen('quizList');
    }
  };
  
  const renderScreen = () => {
    const currentDisplayTheme = screen === 'themeSelection' ? previewTheme : theme;
    const isThemeDark = ['dark', 'graphite', 'gray'].includes(currentDisplayTheme);
    const themeClass = isThemeDark ? 'dark' : '';
    const mainClass = "h-screen w-screen font-sans transition-colors duration-500 overflow-y-auto";

    if (!isInitialized) return <div className={`${mainClass} bg-gray-900 flex items-center justify-center`}><Spinner /></div>;
    if (isLoading) return <div className="relative w-full h-full"><PlexusBackground theme={currentDisplayTheme} /><LoadingScreen text={loadingText} progress={generationProgress} theme={currentDisplayTheme} /></div>;
    if (error) return (<div className={`${mainClass} flex items-center justify-center`}><div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-lg"><h2 className="text-2xl text-red-500 mb-4">Ocorreu um Erro</h2><p className="mb-6">{error}</p><button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">Recarregar</button></div></div>);
    
    let content;
    switch (screen) {
      case 'welcome': content = <WelcomeScreen onStart={() => setScreen('themeSelection')} onShowFeatures={() => setScreen('features')} />; break;
      case 'features': content = <FeaturesScreen onBack={() => setScreen('welcome')} />; break;
      case 'themeSelection': content = <ThemeSelectionScreen onThemeSelect={handlePreviewTheme} onConfirmTheme={handleConfirmTheme} onBack={handleBackFromThemeSelection} currentTheme={previewTheme} />; break;
      case 'quizList': content = <QuizListScreen user={user} onStartNewQuiz={handleStartNewQuiz} onSelectQuiz={handleSelectQuiz} theme={theme} onBack={() => setScreen('themeSelection')} onShowPerformance={() => setScreen('globalPerformance')} appId={appId} />; break;
      case 'globalPerformance': content = <GlobalPerformanceDashboard user={user} theme={theme} onBack={() => setScreen('quizList')} appId={appId} />; break;
      case 'sourceSelection': content = <SourceSelectionScreen onSourceSelect={(source) => { if (source === 'file') setScreen('fileInput'); else if (source === 'topic') setScreen('topicInput'); else if (source === 'converter') setScreen('converterInput'); }} onBack={() => { setTargetFolderId(null); setScreen('quizList'); }} theme={theme} />; break;
      case 'fileInput': content = <FileInputScreen onFilesProcessed={handleFilesProcessed} onBack={() => setScreen('sourceSelection')} isPdfJsLoaded={isPdfJsLoaded} isMammothLoaded={isMammothLoaded} theme={theme} />; break;
      case 'converterInput': content = <FileConverterInputScreen onFileProcessed={handleFileProcessedForConversion} onBack={() => setScreen('sourceSelection')} isPdfJsLoaded={isPdfJsLoaded} theme={theme} />; break;
      case 'conversionQuestionCount': content = <ConversionQuestionCountScreen onConvert={handleStartConversion} onBack={() => setScreen('converterInput')} theme={theme} />; break;
      case 'fileOrder': content = <FileOrderScreen onOrderSelect={handleFileOrderSelect} onBack={() => setScreen('fileInput')} theme={theme} />; break;
      case 'topicInput': content = <TopicInputScreen onTopicSubmit={handleTopicSubmit} onBack={() => setScreen('sourceSelection')} theme={theme} />; break;
      case 'customization': content = <CustomizationScreen onContinueWithPreferences={handleContinueWithPreferences} onContinueWithoutPreferences={handleContinueWithoutPreferences} onBack={() => quizSource.type === 'file' ? (quizSource.content.length > 1 ? setScreen('fileOrder') : setScreen('fileInput')) : setScreen('sourceSelection')} theme={theme} />; break;
      case 'questionCountInput': content = <InitialQuestionCountScreen onGenerate={generateAndSaveQuiz} onBack={() => quizSource.type === 'file' ? setScreen('customization') : setScreen('topicInput')} theme={theme} />; break;
      case 'quiz': content = activeQuiz && <QuizScreen activeQuiz={activeQuiz} onQuizUpdate={(quizId, updatedData) => setActiveQuiz(prev => ({...prev, data: {...prev.data, ...updatedData}}))} onFinish={(quiz) => { setActiveQuiz(quiz); setScreen('results'); }} onBackToList={() => { setActiveQuiz(null); setScreen('quizList'); }} onAddRequest={(quiz) => setAddMoreOptions({ show: true, quiz })} onAddConvertedRequest={(quiz) => setRequestAddConverted(quiz)} onCreateErrorNotebook={handleCreateErrorNotebook} theme={theme} appId={appId} />; break;
      case 'results': content = activeQuiz && <ResultsScreen activeQuiz={activeQuiz} onBackToList={() => { setActiveQuiz(null); setScreen('quizList'); }} onReview={handleSelectQuiz} onAddRequest={(quiz) => setAddMoreOptions({ show: true, quiz })} onAddConvertedRequest={(quiz) => setRequestAddConverted(quiz)} onCreateErrorNotebook={handleCreateErrorNotebook} theme={theme} />; break;
      default: content = <div className="flex items-center justify-center h-full w-full"><Spinner text="Carregando..." /></div>;
    }
    return (
      <div className={`${mainClass} ${themeClass}`}>
        <PlexusBackground theme={screen === 'welcome' || screen === 'features' ? 'dark' : currentDisplayTheme} />
        <div className="relative z-10 w-full h-full">
          {content}
        </div>
        {addMoreOptions.show && <AddMoreQuestionsFlowModal quiz={addMoreOptions.quiz} onClose={() => setAddMoreOptions({ show: false, quiz: null })} onGenerate={handleAddMoreGeneratedQuestions} />}
        {requestAddConverted && <RequestMoreQuestionsModal title="Adicionar Mais Questões" message="Quantas mais questões do arquivo você gostaria de converter e adicionar?" onClose={() => setRequestAddConverted(null)} onAdd={handleAddMoreConvertedQuestions} />}
        {modalInfo.show && <Modal title={modalInfo.title} onClose={() => setModalInfo({ show: false, title: '', message: '' })}><p>{modalInfo.message}</p><div className="mt-6 flex justify-end"><button onClick={() => setModalInfo({ show: false, title: '', message: '' })} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">OK</button></div></Modal>}
      </div>
    );
  };

  return renderScreen();
}
import React from "react";
import { Search, MessageSquare, Users, CheckCircle } from "lucide-react";
import { CyberMesh } from "@/components/ui/CyberMesh";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Explore o Catálogo",
      description:
        "Consulte fotos em alta definição, especificações técnicas detalhadas e status de disponibilidade dos produtos.",
    },
    {
      number: "02",
      icon: MessageSquare,
      title: "Selecione o Produto",
      description:
        "Clique no botão de interesse para abrir o WhatsApp com mensagem automática identificando o item visualizado.",
    },
    {
      number: "03",
      icon: Users,
      title: "Atendimento Personalizado",
      description:
        "Tire dúvidas técnicas, confirme compatibilidade e consulte condições com nossa equipe especializada.",
    },
    {
      number: "04",
      icon: CheckCircle,
      title: "Conclusão Direta",
      description:
        "A negociação, formas de pagamento e entrega ou retirada são combinadas diretamente com a loja, sem intermediários.",
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 border-b border-zinc-850 bg-dark-900/40">
      <CyberMesh variant="subtle" position="bottom-left" opacityClass="opacity-15 sm:opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
            Jornada do Cliente
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">
            Como Funciona a Compra
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Sem processos complexos de checkout ou intermediários: transparência, assessoria técnica e negociação direta pela loja.
          </p>
        </div>

        {/* Grade de Passos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col p-6 rounded-lg bg-dark-950 border border-zinc-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-sm font-semibold text-zinc-600">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-1.5 flex-1">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

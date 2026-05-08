import { useRef, useState } from "react";
import html2canvas from "html2canvas";

export default function PromoKit() {
  const arteRef = useRef(null);
  const [logoCliente, setLogoCliente] = useState(null);

  function carregarLogo(e) {
    const file = e.target.files[0];

    if (file) {
      const url = URL.createObjectURL(file);
      setLogoCliente(url);
    }
  }

  async function baixarStories() {
    if (!arteRef.current) return;

    try {
      const canvas = await html2canvas(arteRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const imagem = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = imagem;
      link.download = "promoja-parceiro-stories.png";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar arte:", error);
      alert("Erro ao baixar a arte.");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center px-4 py-8">
      
      <h1 className="text-3xl font-black mb-2">
        PromoKit
      </h1>

      <p className="text-zinc-400 mb-6 text-center">
        Gerador de arte para restaurantes parceiros
      </p>

      {/* Upload */}
      <label className="bg-orange-600 hover:bg-orange-700 transition cursor-pointer px-6 py-3 rounded-xl font-bold mb-6">
        Selecionar logo PNG

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={carregarLogo}
          className="hidden"
        />
      </label>

      {/* Área da arte */}
      <div
        ref={arteRef}
        className="relative w-[360px] h-[640px] overflow-hidden rounded-[24px]"
      >
        {/* Arte base */}
        <img
          src="/templates/stories-base.png"
          crossOrigin="anonymous"
          alt="Arte padrão PromoJá"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Logo restaurante */}
        <div className="absolute top-[330px] left-1/2 -translate-x-1/2 w-[180px] h-[180px] flex items-center justify-center overflow-hidden">
          
          {logoCliente ? (
            <img
              src={logoCliente}
              alt="Logo restaurante"
              className="w-[82%] h-[82%] object-contain"
            />
          ) : (
            <div className="text-center text-white font-black text-sm px-4">
              LOGO DO RESTAURANTE
            </div>
          )}

        </div>
      </div>

      {/* Botão download */}
      <button
        onClick={baixarStories}
        className="mt-6 bg-white text-black px-8 py-3 rounded-xl font-black hover:bg-zinc-200 transition"
      >
        Baixar Stories PNG
      </button>

      <p className="text-xs text-zinc-500 mt-4 text-center max-w-sm">
        Use preferencialmente uma logo PNG sem fundo para melhor resultado.
      </p>

    </div>
  );
}
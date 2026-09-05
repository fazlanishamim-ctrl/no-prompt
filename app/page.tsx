'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  X,
  Download,
  RefreshCw,
  SlidersHorizontal,
  PlusCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

const CATEGORIES = [
  'Auto Detect',
  'Perfume & Fragrance',
  'Beauty & Cosmetics',
  'Fashion & Apparel',
  'Shoes & Footwear',
  'Watches & Jewellery',
  'Electronics & Gadgets',
  'Food & Beverage',
  'Toys & Games',
  'General Product',
];

const CREATIVE_TYPES = [
  'Product Launch',
  'Product Advertisement',
  'Product Promotion',
  'Special Offer',
  'Social Media Post',
  'Catalogue Showcase',
];

const STYLES = [
  'Automatic',
  'Luxury Studio',
  'Clean Minimalist',
  'Modern Neon',
  'Natural Botanical',
  'Warm Lifestyle',
];

const SCENES = [
  'Automatic',
  'Marble Pedestal',
  'Reflective Glass Podium',
  'Dark Velvet Surface',
  'Wooden Countertop',
  'Studio Gradient',
];

const FORMATS = [
  { id: 'square', label: 'Square (1:1)', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait (4:5)', w: 1080, h: 1350 },
  { id: 'story', label: 'Story (9:16)', w: 1080, h: 1920 },
];

export default function ProductBoomApp() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const [category, setCategory] = useState('Auto Detect');
  const [creativeType, setCreativeType] = useState('Product Launch');
  const [style, setStyle] = useState('Luxury Studio');
  const [scene, setScene] = useState('Automatic');
  const [format, setFormat] = useState('square');
  const [customInstructions, setCustomInstructions] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  };

  const STAGES = [
    'Analyzing product image...',
    'Preserving labels and packaging details...',
    'Generating studio environment...',
    'Compositing lighting and contact shadows...',
    'Finalizing HD creative...',
  ];

  const generateCreative = async () => {
    if (!file) return;

    setErrorMsg(null);
    setIsGenerating(true);
    setStageIndex(0);

    // Cosmetic stage animation while the real request is in flight —
    // it just cycles text, it doesn't gate the actual generation anymore.
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + 1, STAGES.length - 1);
      setStageIndex(current);
    }, 900);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);
      formData.append('creativeType', creativeType);
      formData.append('style', style);
      formData.append('scene', scene);
      formData.append('format', format);
      formData.append('customInstructions', customInstructions);

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Generation failed.');
      }

      setResultUrl(data.image);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong while generating your creative.');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `productboom-${Date.now()}.png`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-12">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">
                ProductBoom AI
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Upload. Select. Boom.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Demo Mode Ready
          </span>
        </div>
      </header>

      <div className="max-w-4xl w-full mx-auto px-4 mt-8 flex-1">
        {isGenerating ? (
          <div className="min-h-[420px] flex flex-col items-center justify-center text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Generating Creative</h3>
            <p className="text-sm font-medium text-slate-400 tracking-wide">{STAGES[stageIndex]}</p>
          </div>
        ) : resultUrl ? (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
              <img
                src={resultUrl}
                alt="Generated Creative"
                className="max-h-[480px] w-auto rounded-xl shadow-2xl border border-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={generateCreative}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
              <button
                onClick={() => setResultUrl(null)}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition"
              >
                <SlidersHorizontal className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => {
                  setResultUrl(null);
                  handleFile(null);
                }}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition"
              >
                <PlusCircle className="w-4 h-4" /> New
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Upload */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                1. Upload Product Photo
              </h2>
              {!previewUrl ? (
                <div
                  onClick={() => inputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 bg-slate-950/50"
                >
                  <UploadCloud className="w-8 h-8 text-blue-400" />
                  <p className="font-semibold text-white text-sm">Click to upload product image</p>
                  <p className="text-xs text-slate-500">Supports PNG, JPG, WEBP</p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={previewUrl}
                      alt="Upload preview"
                      className="h-16 w-16 object-contain rounded-lg bg-slate-900"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-xs">{file?.name}</p>
                      <p className="text-xs text-slate-400">Ready for generation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFile(null)}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* 2. Select Options */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Select Creative Options
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Product Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Creative Purpose
                  </label>
                  <select
                    value={creativeType}
                    onChange={(e) => setCreativeType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {CREATIVE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Design Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {STYLES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scene / Background
                  </label>
                  <select
                    value={scene}
                    onChange={(e) => setScene(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {SCENES.map((sc) => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Format Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${
                        format === f.id
                          ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom instructions — escape hatch beyond the fixed dropdowns */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Custom Instructions <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. add a soft pink gradient, place the bottle on a bed of rose petals, keep the cap facing left..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3">
                {errorMsg}
              </div>
            )}

            {/* Generate CTA */}
            <button
              onClick={generateCreative}
              disabled={!previewUrl}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition ${
                previewUrl
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer shadow-blue-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Sparkles className="w-5 h-5" /> ✨ GENERATE CREATIVE
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
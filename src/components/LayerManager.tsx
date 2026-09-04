import React from 'react';
import { InsulationLayer, InsulationMaterial, InsulationPosition } from '../types';
import { Plus, Trash2, Layers, AlertCircle, ShieldCheck, ShieldAlert, ShieldOff, Sparkles } from 'lucide-react';

interface Props {
  hasInsulation: boolean;
  onToggleHasInsulation: (enabled: boolean) => void;
  layers: InsulationLayer[];
  isMultiLayer: boolean;
  insulationMaterials: InsulationMaterial[];
  onToggleMultiLayer: (enabled: boolean) => void;
  onUpdateLayers: (layers: InsulationLayer[]) => void;
  onOpenAddMaterialModal: () => void;
  ductMaterialName?: string;
}

export const LayerManager: React.FC<Props> = ({
  hasInsulation,
  onToggleHasInsulation,
  layers,
  isMultiLayer,
  insulationMaterials,
  onToggleMultiLayer,
  onUpdateLayers,
  onOpenAddMaterialModal,
  ductMaterialName = 'Shell Ducting',
}) => {
  const handleAddLayer = (pos: InsulationPosition) => {
    const defaultMat =
      pos === 'inside'
        ? insulationMaterials.find((m) => m.isRefractory) || insulationMaterials[0]
        : insulationMaterials.find((m) => !m.isRefractory) || insulationMaterials[0];

    const newLayer: InsulationLayer = {
      id: `layer-${Date.now()}`,
      materialId: defaultMat.id,
      position: pos,
      thicknessMm: pos === 'inside' ? 100 : 50,
      name: defaultMat.name,
    };

    onUpdateLayers([...layers, newLayer]);
  };

  const handleRemoveLayer = (id: string) => {
    if (layers.length <= 1) {
      // If removing last layer, switch to bare duct mode
      onToggleHasInsulation(false);
      return;
    }
    onUpdateLayers(layers.filter((l) => l.id !== id));
  };

  const handleUpdateLayer = (id: string, updates: Partial<InsulationLayer>) => {
    onUpdateLayers(
      layers.map((l) => {
        if (l.id === id) {
          const updated = { ...l, ...updates };
          if (updates.materialId) {
            const mat = insulationMaterials.find((m) => m.id === updates.materialId);
            if (mat) updated.name = mat.name;
          }
          return updated;
        }
        return l;
      })
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
      {/* Header and Master Data Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Konfigurasi Lapisan Isolasi</h3>
        </div>

        <button
          type="button"
          onClick={onOpenAddMaterialModal}
          className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          + Material Baru
        </button>
      </div>

      {/* Segmented Control: Dengan Isolasi vs Tanpa Isolasi (Bare Duct) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">Status Sistem Isolasi:</label>
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 gap-1">
          <button
            type="button"
            id="opt-with-insulation"
            onClick={() => onToggleHasInsulation(true)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              hasInsulation
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Dengan Isolasi Termal</span>
          </button>

          <button
            type="button"
            id="opt-bare-duct"
            onClick={() => onToggleHasInsulation(false)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              !hasInsulation
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldOff className="w-4 h-4 text-amber-200" />
            <span>Tanpa Isolasi (Bare Duct)</span>
          </button>
        </div>
      </div>

      {/* Case 1: Tanpa Isolasi (Bare Pipe / Bare Ducting) */}
      {!hasInsulation ? (
        <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Kondisi: Pipa / Ducting Telanjang (Uninsulated / Bare)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 font-semibold">
                  0 mm Isolator
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ducting saat ini beroperasi tanpa isolasi luar maupun refraktori dalam. Panas dari fluida mengalir langsung menembus plat baja shell ({ductMaterialName}) dan terbuang bebas ke udara lingkungan melalui konveksi dan radiasi termal.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block">Tujuan & Kegunaan Opsi Tanpa Isolasi:</span>
            <ul className="space-y-1 pl-1 list-disc list-inside text-slate-300">
              <li>
                <strong className="text-amber-300">Baseline Audit Energi:</strong> Mengukur berapa kW panas dan juta rupiah bahan bakar yang terbuang sia-sia sebelum pipa diisolasi.
              </li>
              <li>
                <strong className="text-amber-300">Justifikasi Investasi:</strong> Menghitung nilai potensi penghematan tahunan dan periode balik modal (<em>Payback Period</em>).
              </li>
              <li>
                <strong className="text-amber-300">Keselamatan Kerja:</strong> Mengevaluasi bahaya suhu permukaan eksternal plat baja terhadap batas sentuh personil (&gt;60°C).
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">Ingin menambahkan isolator termal?</span>
            <button
              type="button"
              onClick={() => onToggleHasInsulation(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              + Pasang Lapisan Isolasi
            </button>
          </div>
        </div>
      ) : (
        /* Case 2: Dengan Isolasi Termal */
        <div className="space-y-3">
          {/* Sub-header with Multi-Layer Checkbox */}
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400">
              Jumlah Lapisan:{' '}
              <strong className="text-slate-200">
                {layers.length} Lapis ({isMultiLayer ? 'Multi-Layer' : 'Single-Layer'})
              </strong>
            </span>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700 hover:border-slate-600 transition-colors">
              <input
                type="checkbox"
                checked={isMultiLayer}
                onChange={(e) => onToggleMultiLayer(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700"
              />
              <span className="font-medium">Multi-Layer (Opsional)</span>
            </label>
          </div>

          {/* Layer List */}
          <div className="space-y-2.5">
            {layers.map((layer, index) => {
              return (
                <div
                  key={layer.id}
                  className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[11px] shrink-0">
                      {index + 1}
                    </span>

                    <div>
                      <select
                        value={layer.position}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, { position: e.target.value as InsulationPosition })
                        }
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-[11px] font-medium"
                      >
                        <option value="outside">Isolator di LUAR Shell Ducting</option>
                        <option value="inside">Refraktori di DALAM Shell (Lining)</option>
                      </select>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {layer.position === 'inside'
                          ? 'Lining kontak langsung dengan fluida gas panas'
                          : 'Isolasi penahan panas ke udara bebas'}
                      </span>
                    </div>
                  </div>

                  {/* Material Dropdown */}
                  <div className="flex-1 w-full sm:w-auto">
                    <select
                      value={layer.materialId}
                      onChange={(e) => handleUpdateLayer(layer.id, { materialId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <optgroup label="Bata Tahan Api & Castable (Internal)">
                        {insulationMaterials
                          .filter((m) => m.isRefractory)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} (k={m.thermalConductivity} W/mK, Max {m.maxServiceTempC}°C)
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Isolator Blanket, Board, & Silicate (Eksternal)">
                        {insulationMaterials
                          .filter((m) => !m.isRefractory)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} (k={m.thermalConductivity} W/mK, Max {m.maxServiceTempC}°C)
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Thickness Input */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="600"
                        value={layer.thicknessMm}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, {
                            thicknessMm: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-400 text-xs">mm</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLayer(layer.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title={layers.length <= 1 ? 'Hapus dan jadikan tanpa isolasi' : 'Hapus lapisan'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Layer Buttons if Multi-Layer is Enabled */}
          {isMultiLayer ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAddLayer('outside')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                + Tambah Lapis Isolasi Luar
              </button>
              <button
                type="button"
                onClick={() => handleAddLayer('inside')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                + Tambah Refraktori Dalam (Kiln / Lining)
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Mode single-layer aktif. Centang "Multi-Layer" jika ingin menggabungkan beberapa lapis material berbeda.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

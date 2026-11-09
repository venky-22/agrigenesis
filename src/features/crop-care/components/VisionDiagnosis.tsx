
import React, { useState, useRef } from 'react';
import { getPlantHealthDiagnosis } from '../services/aiService';
import MarkdownRenderer from './MarkdownRenderer';
import { useToast } from './Toast';

const VisionDiagnosis: React.FC = () => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setDiagnosis(null);
        toast.info('Image uploaded! Click analyze to diagnose.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    toast.info('Analyzing plant health...');
    try {
      const base64 = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      const result = await getPlantHealthDiagnosis(base64, mimeType);
      setDiagnosis(result);
      toast.success('Diagnosis complete!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze plant health');
      setDiagnosis("Error analyzing plant health. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-xl border border-white/10 hover:shadow-2xl transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <i className="fas fa-microscope text-emerald-400"></i>
        AI Plant Health Diagnosis
      </h3>

      {!image ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-slate-400 transition-all duration-200 cursor-pointer relative ${
            dragActive
              ? 'border-emerald-500 bg-emerald-500/20 backdrop-blur-md scale-105'
              : 'border-white/10 hover:border-emerald-500/50 hover:bg-white/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className={`transition-all duration-200 ${dragActive ? 'scale-110' : ''}`}>
            <i className="fas fa-cloud-upload-alt text-4xl mb-3 text-emerald-400"></i>
          </div>
          <p className="text-sm font-semibold text-slate-100 mb-1">
            {dragActive ? 'Drop image here' : 'Upload or drag plant photo'}
          </p>
          <p className="text-xs text-slate-300">Identify pests, diseases, or deficiencies</p>
          <p className="text-[10px] text-slate-400 mt-2">JPG, PNG up to 5MB</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="relative rounded-lg overflow-hidden bg-white/5 backdrop-blur-md group">
            <img
              src={image}
              alt="Plant to diagnose"
              className="w-full h-56 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <button
              onClick={() => {
                setImage(null);
                setDiagnosis(null);
                toast.info('Image cleared');
              }}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md text-emerald-300 py-3 rounded-lg hover:shadow-2xl hover:bg-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Analyzing...
              </>
            ) : (
              <>
                <i className="fas fa-search-plus"></i>
                Analyze Plant Health
              </>
            )}
          </button>

          {diagnosis && (
            <div className="mt-4 p-4 bg-emerald-500/20 backdrop-blur-md rounded-lg border-2 border-emerald-500/30 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <i className="fas fa-clipboard-check text-emerald-400 text-sm"></i>
                </div>
                <h4 className="font-bold text-emerald-200 text-sm">Diagnosis & Recommendations</h4>
              </div>
              <MarkdownRenderer content={diagnosis} className="text-xs" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisionDiagnosis;

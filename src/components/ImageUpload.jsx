import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ImageUpload({ onImageChange, required = false }) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    if (onImageChange) {
      onImageChange(file, url);
    }
  }, [onImageChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    maxFiles: 1,
  });

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageChange && onImageChange(null, null);
  };

  return (
    <div>
      {!preview ? (
        <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}>
          <input {...getInputProps()} />
          <div className="upload-zone-icon">
            <Upload size={36} />
          </div>
          <p className="upload-zone-text">
            {isDragActive ? 'Drop your image here...' :
              <><span>{t('upload_label')}</span><br />Drag & drop or click to browse<br /><small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Supports JPG, PNG, WEBP · Max 10MB</small></>
            }
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
          }} />
          <button
            onClick={removeImage}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.9)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
            }}
          >
            <X size={16} />
          </button>
          <div style={{
            position: 'absolute', bottom: '10px', left: '10px',
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'white', fontSize: '0.8rem', fontWeight: 600,
          }}>
            <Image size={14} /> Image uploaded ✓
          </div>
        </div>
      )}
    </div>
  );
}

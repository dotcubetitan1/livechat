const PreviewModal = ({ preview, onClose }) => {
  if (!preview) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={onClose}>
      {preview.type === "image" ? (
        <img src={preview.url} className="max-h-[90%] max-w-[90%] rounded-lg" />
      ) : (
        <video src={preview.url} controls autoPlay className="max-h-[90%] max-w-[90%] rounded-lg" />
      )}
    </div>
  );
};

export default PreviewModal;
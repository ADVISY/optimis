import mascotPointing from "@/assets/mascotte-optimis-hd.png";

interface MobileMascotProps {
  className?: string;
}

const MobileMascot = ({ className = "" }: MobileMascotProps) => {
  return (
    <div className={`md:hidden fixed bottom-4 right-2 z-50 pointer-events-none ${className}`}>
      <img
        src={mascotPointing}
        alt="Mascotte Optimis"
        className="h-24 w-auto drop-shadow-xl animate-fade-in opacity-90"
      />
    </div>
  );
};

export default MobileMascot;

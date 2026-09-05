export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#030308' }}>
      {/* Base gradient layer */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(99,50,180,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(40,80,200,0.06) 0%, transparent 60%)',
      }} />

      {/* Diagonal light beams */}
      <div className="absolute inset-0">
        <div className="absolute beam-beam-1" />
        <div className="absolute beam-beam-2" />
        <div className="absolute beam-beam-3" />
        <div className="absolute beam-beam-4" />
        <div className="absolute beam-beam-5" />
      </div>

      {/* Geometric energy waves */}
      <div className="absolute inset-0">
        <div className="absolute wave wave-1" />
        <div className="absolute wave wave-2" />
        <div className="absolute wave wave-3" />
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0">
        <div className="absolute orb orb-1" />
        <div className="absolute orb orb-2" />
        <div className="absolute orb orb-3" />
        <div className="absolute orb orb-4" />
      </div>

      {/* Mesh grid overlay */}
      <div className="absolute inset-0 mesh-grid" />

      {/* Scan line */}
      <div className="absolute inset-0 scan-line" />

      <style>{`
        /* Diagonal light beams */
        .beam-beam-1 {
          width: 2px;
          height: 200%;
          background: linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.4) 20%, rgba(168,85,247,0.8) 50%, rgba(59,130,246,0.4) 80%, transparent 100%);
          transform: rotate(45deg) translateX(-50%);
          left: 25%;
          top: -50%;
          filter: blur(8px);
          animation: beamSlide1 8s ease-in-out infinite;
        }
        .beam-beam-2 {
          width: 3px;
          height: 200%;
          background: linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.3) 30%, rgba(99,102,241,0.7) 50%, rgba(168,85,247,0.3) 70%, transparent 100%);
          transform: rotate(45deg) translateX(-50%);
          left: 50%;
          top: -50%;
          filter: blur(12px);
          animation: beamSlide2 10s ease-in-out infinite;
        }
        .beam-beam-3 {
          width: 2px;
          height: 200%;
          background: linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.5) 25%, rgba(99,102,241,0.6) 50%, rgba(59,130,246,0.5) 75%, transparent 100%);
          transform: rotate(55deg) translateX(-50%);
          left: 75%;
          top: -50%;
          filter: blur(10px);
          animation: beamSlide3 12s ease-in-out infinite;
        }
        .beam-beam-4 {
          width: 1.5px;
          height: 200%;
          background: linear-gradient(180deg, transparent 0%, rgba(192,132,252,0.4) 40%, rgba(168,85,247,0.6) 50%, rgba(96,165,250,0.4) 60%, transparent 100%);
          transform: rotate(35deg) translateX(-50%);
          left: 15%;
          top: -50%;
          filter: blur(6px);
          animation: beamSlide4 9s ease-in-out infinite;
        }
        .beam-beam-5 {
          width: 2.5px;
          height: 200%;
          background: linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.3) 35%, rgba(99,102,241,0.5) 50%, rgba(139,92,246,0.3) 65%, transparent 100%);
          transform: rotate(50deg) translateX(-50%);
          left: 90%;
          top: -50%;
          filter: blur(14px);
          animation: beamSlide5 11s ease-in-out infinite;
        }

        @keyframes beamSlide1 {
          0%, 100% { transform: rotate(45deg) translateX(-50%) translateY(0); opacity: 0.4; }
          50% { transform: rotate(45deg) translateX(-50%) translateY(20px); opacity: 0.8; }
        }
        @keyframes beamSlide2 {
          0%, 100% { transform: rotate(45deg) translateX(-50%) translateY(0); opacity: 0.3; }
          50% { transform: rotate(45deg) translateX(-50%) translateY(-30px); opacity: 0.7; }
        }
        @keyframes beamSlide3 {
          0%, 100% { transform: rotate(55deg) translateX(-50%) translateY(0); opacity: 0.5; }
          50% { transform: rotate(55deg) translateX(-50%) translateY(25px); opacity: 0.9; }
        }
        @keyframes beamSlide4 {
          0%, 100% { transform: rotate(35deg) translateX(-50%) translateY(0); opacity: 0.3; }
          50% { transform: rotate(35deg) translateX(-50%) translateY(-20px); opacity: 0.6; }
        }
        @keyframes beamSlide5 {
          0%, 100% { transform: rotate(50deg) translateX(-50%) translateY(0); opacity: 0.2; }
          50% { transform: rotate(50deg) translateX(-50%) translateY(15px); opacity: 0.5; }
        }

        /* Geometric energy waves */
        .wave {
          border-radius: 50%;
          border: 1px solid rgba(168,85,247,0.15);
          animation: waveExpand 6s ease-out infinite;
        }
        .wave-1 {
          width: 300px;
          height: 300px;
          top: 50%;
          left: 50%;
          margin-left: -150px;
          margin-top: -150px;
          animation-delay: 0s;
          box-shadow: 0 0 20px rgba(168,85,247,0.1), inset 0 0 20px rgba(168,85,247,0.05);
        }
        .wave-2 {
          width: 300px;
          height: 300px;
          top: 50%;
          left: 50%;
          margin-left: -150px;
          margin-top: -150px;
          animation-delay: 2s;
          border-color: rgba(59,130,246,0.15);
          box-shadow: 0 0 20px rgba(59,130,246,0.1), inset 0 0 20px rgba(59,130,246,0.05);
        }
        .wave-3 {
          width: 300px;
          height: 300px;
          top: 50%;
          left: 50%;
          margin-left: -150px;
          margin-top: -150px;
          animation-delay: 4s;
          border-color: rgba(139,92,246,0.12);
          box-shadow: 0 0 25px rgba(139,92,246,0.08), inset 0 0 25px rgba(139,92,246,0.04);
        }

        @keyframes waveExpand {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(4); opacity: 0; }
        }

        /* Floating orbs */
        .orb {
          border-radius: 50%;
          animation: orbFloat 15s ease-in-out infinite;
        }
        .orb-1 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%);
          top: 20%;
          left: 15%;
          filter: blur(30px);
          animation-delay: 0s;
        }
        .orb-2 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
          top: 60%;
          left: 75%;
          filter: blur(35px);
          animation-delay: -5s;
        }
        .orb-3 {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
          top: 70%;
          left: 25%;
          filter: blur(25px);
          animation-delay: -10s;
        }
        .orb-4 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
          top: 30%;
          left: 80%;
          filter: blur(28px);
          animation-delay: -7s;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.1); }
          50% { transform: translate(-20px, -60px) scale(0.9); }
          75% { transform: translate(-40px, -20px) scale(1.05); }
        }

        /* Mesh grid */
        .mesh-grid {
          background-image:
            linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 70%);
        }

        /* Scan line */
        .scan-line {
          background: linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.02) 50%, transparent 100%);
          height: 100px;
          animation: scanDown 8s linear infinite;
        }

        @keyframes scanDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}

import React from 'react';

interface Props {
  onComplete: () => void;
}

export const SliderCaptcha: React.FC<Props> = ({ onComplete }) => {
  return (
    <div className="slider-captcha">
      <p>Arrastra el slider para completar</p>
      <button onClick={onComplete}>Completar Captcha</button>
    </div>
  );
};

import { useEffect } from 'react';

const useBodyClass = (className) => {
  useEffect(() => {
    document.body.className = className;
  }, [className]);
};

export default useBodyClass;
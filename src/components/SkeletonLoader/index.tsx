import React from 'react';
import styles from './index.module.scss';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'circle' | 'rect';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  width = '100%',
  height,
  count = 1,
  className = '',
}) => {
  const getHeight = () => {
    if (height) return height;
    switch (type) {
      case 'text':
        return '1rem';
      case 'card':
        return '200px';
      case 'circle':
        return '40px';
      case 'rect':
        return '100px';
      default:
        return '1rem';
    }
  };

  const getClassName = () => {
    const baseClass = styles.skeleton;
    const typeClass = type === 'circle' ? styles.circle : '';
    return `${baseClass} ${typeClass} ${className}`.trim();
  };

  const skeletonStyle = {
    width: type === 'circle' ? getHeight() : width,
    height: getHeight(),
  };

  if (count === 1) {
    return <div className={getClassName()} style={skeletonStyle} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={getClassName()} style={skeletonStyle} />
      ))}
    </>
  );
};

export default SkeletonLoader;

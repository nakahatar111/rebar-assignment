"use client";

import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

export default function Home() {
  return (
    <div style={{ display: 'flex', height: '80vh', width: '90vw'}}>
      <PDFViewer />
    </div>
  );
}

"use client";

import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

export default function Home() {
  return (
    <div style={{ display: 'flex', justifyContent: "center", alignItems: "center", height: '100%', width: '100vw'}}>
      <PDFViewer />
    </div>
  );
}

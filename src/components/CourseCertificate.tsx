import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Certificate } from '../types';

interface CourseCertificateProps {
  certificate: Certificate;
  onDownload?: () => void;
}

export default function CourseCertificate({ certificate, onDownload }: CourseCertificateProps) {
  const certificateRef = React.useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${certificate.template_data.course_name}-certificate.pdf`);
      
      onDownload?.();
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={certificateRef}
        className="bg-white p-16 rounded-lg shadow-lg"
        style={{ width: '1000px', height: '700px' }}
      >
        <div className="border-8 border-primary/20 h-full flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold text-gray-900">Certificate of Completion</h1>
            
            <p className="text-xl text-gray-600">This is to certify that</p>
            
            <p className="text-3xl font-bold text-primary">
              {certificate.template_data.student_name}
            </p>
            
            <p className="text-xl text-gray-600">
              has successfully completed the course
            </p>
            
            <p className="text-2xl font-bold text-gray-900">
              {certificate.template_data.course_name}
            </p>
            
            <div className="pt-8">
              <p className="text-gray-600">
                Completed on {certificate.template_data.completion_date}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Certificate ID: {certificate.template_data.certificate_number}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={downloadCertificate}
        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Download Certificate
      </button>
    </div>
  );
}
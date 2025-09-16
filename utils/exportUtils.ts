
import jsPDF from 'jspdf';
import type { Design, FinishesSchedule, MaterialScheduleItem } from '../types';

// Generic function to trigger a file download
export const downloadFile = (content: string, fileName:string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Specific function for downloading files from a URL (like our base64 data URLs or blob URLs)
export const downloadUrl = (url: string, fileName: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Function to generate and download a comprehensive PDF report
export const generateAndDownloadPdf = async (design: Design) => {
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
    });

    const PAGE_WIDTH = pdf.internal.pageSize.getWidth();
    const PAGE_HEIGHT = pdf.internal.pageSize.getHeight();
    const MARGIN = 40;
    const contentWidth = PAGE_WIDTH - MARGIN * 2;
    let yPos = MARGIN;

    const checkNewPage = (neededHeight: number) => {
        if (yPos + neededHeight > PAGE_HEIGHT - MARGIN) {
            pdf.addPage();
            yPos = MARGIN;
        }
    }
    
    // More robust text wrapping
    const addWrappedText = (text: string, x: number, y: number, options: { maxWidth: number, fontSize: number, fontStyle?: string, color?: string }) => {
        const { maxWidth, fontSize, fontStyle = 'normal', color } = options;
        if(color) pdf.setTextColor(color);
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        const lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;
        return y + (lines.length * lineHeight);
    };


    // Page 1: Title, 3D Render, Description
    yPos = addWrappedText(design.title, MARGIN, yPos, { maxWidth: contentWidth, fontSize: 22, fontStyle: 'bold', color: '#B45309' });
    yPos += 20;

    const mainImage = design.exteriorImageUrls.find(i => i.view.toLowerCase() === 'day')?.url || design.exteriorImageUrls[0]?.url;
    if (mainImage && !mainImage.startsWith('https')) {
        try {
            const imgHeight = (contentWidth * 9) / 16;
            checkNewPage(imgHeight + 20);
            pdf.addImage(mainImage, 'JPEG', MARGIN, yPos, contentWidth, imgHeight);
            yPos += imgHeight + 20;
        } catch(e) { 
            console.error("Failed to add hero image to PDF:", e);
        }
    }

    checkNewPage(40);
    yPos = addWrappedText('Design Concept', MARGIN, yPos, { maxWidth: contentWidth, fontSize: 14, fontStyle: 'bold', color: '#1f2937' });
    yPos += 5;
    yPos = addWrappedText(design.description, MARGIN, yPos, { maxWidth: contentWidth, fontSize: 10, color: '#4b5563' });
    yPos += 25;

    // Materials and Color Palette
    checkNewPage(80);
    yPos = addWrappedText('Key Materials & Palette', MARGIN, yPos, { maxWidth: contentWidth, fontSize: 14, fontStyle: 'bold', color: '#1f2937' });
    yPos += 5;
    yPos = addWrappedText(design.materials?.join(', ') || 'N/A', MARGIN, yPos, { maxWidth: contentWidth, fontSize: 10, color: '#4b5563' });
    yPos += 15;
    if (design.colorPalette && design.colorPalette.length > 0) {
        let xPos = MARGIN;
        design.colorPalette.forEach(color => {
            if (xPos + 75 > PAGE_WIDTH - MARGIN) { xPos = MARGIN; yPos += 30; checkNewPage(30); }
            pdf.setFillColor(color);
            pdf.rect(xPos, yPos, 20, 20, 'F');
            addWrappedText(color, xPos + 25, yPos + 14, { maxWidth: 50, fontSize: 10, color: '#4b5563' });
            xPos += 75;
        });
        yPos += 35;
    }

    // Interior Renderings Section
    if (design.interiorImageUrls && design.interiorImageUrls.length > 0) {
        pdf.addPage();
        yPos = MARGIN;
        yPos = addWrappedText('Interior Renderings', MARGIN, yPos, { maxWidth: contentWidth, fontSize: 18, fontStyle: 'bold', color: '#B45309'});
        yPos += 15;
        
        for (const interior of design.interiorImageUrls) {
            checkNewPage(20);
            yPos = addWrappedText(interior.room, MARGIN, yPos, { maxWidth: contentWidth, fontSize: 14, fontStyle: 'bold', color: '#1f2937' });
            yPos += 10;
            if(interior.url && !interior.url.startsWith('https')) {
                try {
                    // Assuming interior shots are more square-ish 4:3
                    const interiorImgHeight = (contentWidth * 3) / 4;
                    checkNewPage(interiorImgHeight + 20);
                    pdf.addImage(interior.url, 'JPEG', MARGIN, yPos, contentWidth, interiorImgHeight);
                    yPos += interiorImgHeight + 20;
                } catch(e) { 
                    console.error(`Failed to add interior image to PDF for room ${interior.room}:`, e);
                }
            }
        }
    }


    // Floor Plans Section
    if (design.floorPlanUrls && design.floorPlanUrls.length > 0) {
        pdf.addPage();
        yPos = MARGIN;
        yPos = addWrappedText('Floor Plans', MARGIN, yPos, { maxWidth: contentWidth, fontSize: 18, fontStyle: 'bold', color: '#B45309'});
        yPos += 15;
        
        for (const plan of design.floorPlanUrls) {
            checkNewPage(20);
            yPos = addWrappedText(plan.level, MARGIN, yPos, { maxWidth: contentWidth, fontSize: 14, fontStyle: 'bold', color: '#1f2937' });
            yPos += 10;
            if(plan.url && !plan.url.startsWith('https')) {
                try {
                    const planImgHeight = (contentWidth * 3) / 4; // Assuming 4:3 ratio for plans
                    checkNewPage(planImgHeight + 20);
                    pdf.addImage(plan.url, 'JPEG', MARGIN, yPos, contentWidth, planImgHeight);
                    yPos += planImgHeight + 20;
                } catch(e) { 
                    console.error(`Failed to add floor plan image to PDF for level ${plan.level}:`, e);
                }
            }
        }
    }
    
    // Page 3+: Finishes Schedule
    if (design.finishesSchedule && Object.keys(design.finishesSchedule).length > 0) {
        pdf.addPage();
        yPos = MARGIN;
        yPos = addWrappedText('Materials & Finishes Schedule', MARGIN, yPos, { maxWidth: contentWidth, fontSize: 18, fontStyle: 'bold', color: '#B45309' });
        yPos += 25;

        const addScheduleCategory = (title: string, items?: MaterialScheduleItem[]) => {
            if (!items || items.length === 0) return;
            checkNewPage(40);
            yPos = addWrappedText(title, MARGIN, yPos, { maxWidth: contentWidth, fontSize: 12, fontStyle: 'bold', color: '#1f2937' });
            yPos += 5;

            // Table Header
            pdf.setFillColor("#e5e7eb"); pdf.rect(MARGIN, yPos, contentWidth, 15, 'F');
            addWrappedText('Location', MARGIN + 5, yPos + 10, { maxWidth: 80, fontSize: 9, fontStyle: 'bold', color: '#374151' });
            addWrappedText('Material', MARGIN + 90, yPos + 10, { maxWidth: 120, fontSize: 9, fontStyle: 'bold', color: '#374151' });
            addWrappedText('Finish', MARGIN + 220, yPos + 10, { maxWidth: 120, fontSize: 9, fontStyle: 'bold', color: '#374151' });
            yPos += 15;

            items.forEach(item => {
                const materialLines = pdf.splitTextToSize(item.material, 120);
                const finishLines = pdf.splitTextToSize(item.finish, 120);
                const locationLines = pdf.splitTextToSize(item.location, 80);
                const neededHeight = Math.max(materialLines.length, finishLines.length, locationLines.length) * 10 + 5;
                checkNewPage(neededHeight);

                addWrappedText(item.location, MARGIN + 5, yPos + 10, { maxWidth: 80, fontSize: 9, color: '#4b5563' });
                addWrappedText(item.material, MARGIN + 90, yPos + 10, { maxWidth: 120, fontSize: 9, color: '#4b5563' });
                addWrappedText(item.finish, MARGIN + 220, yPos + 10, { maxWidth: 120, fontSize: 9, color: '#4b5563' });

                yPos += neededHeight;
                pdf.setDrawColor('#e5e7eb'); pdf.line(MARGIN, yPos, PAGE_WIDTH - MARGIN, yPos);
                yPos += 2;
            });
            yPos += 10;
        };

        for (const category in design.finishesSchedule) {
            addScheduleCategory(category, design.finishesSchedule[category]);
        }
    }

    pdf.save(`${design.title}_SuperArchitectAI_Package.pdf`);
};
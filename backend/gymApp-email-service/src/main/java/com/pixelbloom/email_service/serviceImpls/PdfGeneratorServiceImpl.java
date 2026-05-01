package com.pixelbloom.email_service.serviceImpls;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.pixelbloom.email_service.event.WelcomeEvent;
import com.pixelbloom.email_service.service.PdfGeneratorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@Slf4j
public class PdfGeneratorServiceImpl implements PdfGeneratorService {

    @Override
    public byte[] generateWelcomePdf(WelcomeEvent event) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        // Logo
        try {
            ClassPathResource logoResource = new ClassPathResource("static/images/logo.png");
            byte[] logoBytes = logoResource.getInputStream().readAllBytes();
            Image logo = new Image(ImageDataFactory.create(logoBytes));
            logo.setWidth(120);
            document.add(logo);
        } catch (IOException e) {
            log.warn("Logo not found at static/images/logo.png — generating PDF without logo: {}", e.getMessage());
        }

        // Membership details table
        Table table = new Table(2);
        table.setWidth(com.itextpdf.layout.properties.UnitValue.createPercentValue(100));

        addRow(table, "Member Name", event.getMemberName());
        addRow(table, "Plan Name", event.getPlanName());
        addRow(table, "Start Date", event.getStartDate() != null ? event.getStartDate().toString() : "");
        addRow(table, "End Date", event.getEndDate() != null ? event.getEndDate().toString() : "");
        addRow(table, "Batch Name", event.getBatchName());
        addRow(table, "Time Slot", event.getTimeSlot());
        addRow(table, "Paid Amount", event.getPaidAmount() != null ? String.valueOf(event.getPaidAmount()) : "");
        addRow(table, "Order Number", event.getOrderNumber());

        // Optional diet plan rows
        if (event.getDietPlanName() != null) {
            addRow(table, "Diet Plan", event.getDietPlanName());
            addRow(table, "Diet Start Date", event.getDietStartDate() != null ? event.getDietStartDate().toString() : "");
            addRow(table, "Diet End Date", event.getDietEndDate() != null ? event.getDietEndDate().toString() : "");
        }

        // Optional goal row
        if (event.getGoalDetails() != null) {
            addRow(table, "Goal", event.getGoalDetails());
        }

        document.add(table);
        document.close();

        return baos.toByteArray();
    }

    private void addRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label)));
        table.addCell(new Cell().add(new Paragraph(value != null ? value : "")));
    }
}

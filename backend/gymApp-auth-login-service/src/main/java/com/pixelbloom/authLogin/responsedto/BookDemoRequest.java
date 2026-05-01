package com.pixelbloom.authLogin.responsedto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.pixelbloom.authLogin.enums.BatchCategory;
import com.pixelbloom.authLogin.enums.SlotType;

import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class BookDemoRequest {
    public Long visitorId;
    public String couponCode;
    public BatchCategory batchType;
    public SlotType slotType;
    public String startTime;
    public String endTime;

    @JsonProperty("demoDate")
    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDate demoDate;
    //private int bookNumber; it will be always 1 book request at time ,so consider 1 default

}

package com.pixelbloom.multimediaService.requestDto;

import com.pixelbloom.multimediaService.enums.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateVisibilityRequest {
    @NotNull
    private Visibility visibility;
    private AccessScope accessScope;
    private Long batchId;
}

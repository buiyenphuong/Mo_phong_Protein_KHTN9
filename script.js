/* =========================================================

   MÔ PHỎNG PROTEIN – KHTN 9

========================================================= */

/* =========================================================

   KẾT NỐI HTML

========================================================= */

const macroCanvas =

    document.getElementById("macroCanvas");

const microCanvas =

    document.getElementById("microCanvas");

const temperatureSlider =

    document.getElementById("temperature");

const resetButton =

    document.getElementById("reset");

const macroCtx =

    macroCanvas.getContext("2d");

const microCtx =

    microCanvas.getContext("2d");

/* Ảnh nền thực tế chỉ dùng cho MỨC VĨ MÔ */

const macroBackgroundImage =

    new Image();

macroBackgroundImage.src =

    "macro-bg.png";

/* =========================================================

   BIẾN CHUNG

========================================================= */

let macroW = 0;

let macroH = 0;

let microW = 0;

let microH = 0;

let dpr =

    window.devicePixelRatio || 1;

let temperature = 0;

let time = 0;

let eggWhiteAmount = 0;

/* =========================================================

   TRẠNG THÁI BỌT – BONG BÓNG – ĐÔNG TỤ

========================================================= */

let foamAmount = 0;

let internalBubbleAmount = 0;

let coagulationAmount = 0;

/* =========================================================

   LƯỢNG LÒNG TRẮNG TRONG PIPETTE

========================================================= */

let pipetteEggWhite = 0;

/*

   0 = pipette rỗng

   0.40 = lượng tối đa mô phỏng trong pipette

*/

/* =========================================================

   PIPETTE

========================================================= */

const pipette = {

    x: 0,

    y: 0,

    angle: -0.55,

    dragging: false,

    offsetX: 0,

    offsetY: 0

};

/* =========================================================

   PROTEIN VI MÔ

========================================================= */

const proteins = [];

const proteinColors = [

    "#72a9e8",

    "#79add0",

    "#6fa3c8",

    "#82b5d8"

];

/*

   Các liên kết giữa protein khi tạo mạng lưới.

   Đây là mô hình hóa trực quan sự tập hợp protein,

   không phải biểu diễn chính xác cấu trúc phân tử.

*/

const proteinLinks = [];

/*

   Các hạt nước nhỏ bị giữ trong mạng lưới

   ở giai đoạn đông tụ.

*/

const waterParticles = [];

/* =========================================================

   THAY ĐỔI KÍCH THƯỚC CANVAS

========================================================= */

function resizeCanvases() {

    const macroRect =

        macroCanvas.getBoundingClientRect();

    const microRect =

        microCanvas.getBoundingClientRect();

    macroW =

        macroRect.width;

    macroH =

        macroRect.height;

    microW =

        microRect.width;

    microH =

        microRect.height;

    dpr =

        window.devicePixelRatio || 1;

    macroCanvas.width =

        macroW * dpr;

    macroCanvas.height =

        macroH * dpr;

    microCanvas.width =

        microW * dpr;

    microCanvas.height =

        microH * dpr;

    macroCtx.setTransform(

        dpr,

        0,

        0,

        dpr,

        0,

        0

    );

    microCtx.setTransform(

        dpr,

        0,

        0,

        dpr,

        0,

        0

    );

}

/* =========================================================

   RESET VỊ TRÍ PIPETTE

========================================================= */

function resetPipette() {

    pipette.x =

        macroW * 0.74;

    pipette.y =

        macroH * 0.15;

    pipette.angle =

        -0.55;

    pipette.dragging =

        false;

    pipetteEggWhite =

        0;

}

/* =========================================================

   HÀM VẼ HÌNH CHỮ NHẬT BO GÓC

========================================================= */

function roundedRect(

    ctx,

    x,

    y,

    w,

    h,

    r

) {

    ctx.beginPath();

    ctx.roundRect(

        x,

        y,

        w,

        h,

        r

    );

}

/* =========================================================

   BÓNG

========================================================= */

function addShadow(

    ctx,

    blur = 10,

    alpha = 0.16

) {

    ctx.shadowColor =

        `rgba(30,50,45,${alpha})`;

    ctx.shadowBlur =

        blur;

    ctx.shadowOffsetX =

        0;

    ctx.shadowOffsetY =

        5;

}

function removeShadow(ctx) {

    ctx.shadowColor =

        "transparent";

    ctx.shadowBlur =

        0;

    ctx.shadowOffsetX =

        0;

    ctx.shadowOffsetY =

        0;

}

/* =========================================================

   NỀN MỨC VĨ MÔ

========================================================= */

function drawBackground() {

    /*

       Chỉ thêm ảnh nền thực tế vào MỨC VĨ MÔ.

       Các thành phần tương tác hiện có vẫn được vẽ phía trên.

       Để tránh ảnh nền lấn át mô hình, ảnh được làm nhẹ.

    */

    if (

        macroBackgroundImage.complete &&

        macroBackgroundImage.naturalWidth > 0

    ) {

        macroCtx.save();

        macroCtx.globalAlpha =

            0.28;

        macroCtx.drawImage(

            macroBackgroundImage,

            0,

            0,

            macroW,

            macroH

        );

        macroCtx.restore();

    } else {

        const bg =

            macroCtx.createLinearGradient(

                0,

                0,

                0,

                macroH

            );

        bg.addColorStop(

            0,

            "#fbfdfc"

        );

        bg.addColorStop(

            0.78,

            "#eef5f2"

        );

        bg.addColorStop(

            1,

            "#dce8e3"

        );

        macroCtx.fillStyle =

            bg;

        macroCtx.fillRect(

            0,

            0,

            macroW,

            macroH

        );

    }

}

/* =========================================================

   ỐNG NGHIỆM

========================================================= */

function drawTestTube() {

    const centerX =

        macroW * 0.50;

    const tubeWidth =

        macroW * 0.095;

    const tubeHeight =

        macroH * 0.42;

    const top =

        macroH * 0.25;

    const left =

        centerX -

        tubeWidth / 2;

    const bottom =

        top +

        tubeHeight;

    /* bóng dưới ống nghiệm */

    macroCtx.fillStyle =

        "rgba(50,70,63,0.12)";

    macroCtx.beginPath();

    macroCtx.ellipse(

        centerX,

        bottom + 8,

        tubeWidth * 0.62,

        9,

        0,

        0,

        Math.PI * 2

    );

    macroCtx.fill();

    /* =====================================================

       LÒNG TRẮNG TRỨNG TRONG ỐNG

    ===================================================== */

    if (

        eggWhiteAmount > 0

    ) {

        const amount =

            Math.min(

                eggWhiteAmount,

                0.65

            );

        const liquidHeight =

            tubeHeight * amount;

        const liquidTop =

            bottom -

            liquidHeight;

        const liquid =

            macroCtx.createLinearGradient(

                0,

                liquidTop,

                0,

                bottom

            );

        liquid.addColorStop(

            0,

            "#fffef3"

        );

        liquid.addColorStop(

            1,

            "#e5dfbb"

        );

        macroCtx.fillStyle =

            liquid;

        macroCtx.beginPath();

        macroCtx.moveTo(

            left + 4,

            liquidTop

        );

        macroCtx.lineTo(

            left + tubeWidth - 4,

            liquidTop

        );

        macroCtx.lineTo(

            left + tubeWidth - 4,

            bottom - 12

        );

        macroCtx.quadraticCurveTo(

            centerX,

            bottom + 1,

            left + 4,

            bottom - 12

        );

        macroCtx.closePath();

        macroCtx.fill();

        /* =================================================

           TRẠNG THÁI ĐÔNG TỤ

           Khi lòng trắng đã được đưa vào ống nghiệm, nhiệt độ

           tăng làm protein biến tính và lòng trắng chuyển dần

           từ chất lỏng trong sang khối gel trắng đục.

           Đông tụ được biểu diễn trên toàn bộ thể tích lòng trắng,

           không phải chỉ tạo một lớp bọt ở phía trên.

        ================================================= */

        if (

            coagulationAmount > 0.001

        ) {

            /* Lớp gel chính: càng đông tụ càng trắng đục và đặc. */

            const gelAlpha =

                0.28 +

                0.68 * coagulationAmount;

            macroCtx.fillStyle =

                `rgba(255,255,252,${gelAlpha})`;

            macroCtx.beginPath();

            macroCtx.moveTo(

                left + 4,

                liquidTop

            );

            macroCtx.lineTo(

                left + tubeWidth - 4,

                liquidTop

            );

            macroCtx.lineTo(

                left + tubeWidth - 4,

                bottom - 12

            );

            macroCtx.quadraticCurveTo(

                centerX,

                bottom + 1,

                left + 4,

                bottom - 12

            );

            macroCtx.closePath();

            macroCtx.fill();

            /*

               Khi đông tụ mạnh, thêm các mảng gel mềm, lớn và

               không đều để mắt nhìn thấy rõ khối đông tụ.

               Đây là cấu trúc vĩ mô của gel, không phải hạt protein.

            */

            const gelPatches =

                4 +

                Math.floor(coagulationAmount * 7);

            for (

                let i = 0;

                i < gelPatches;

                i++

            ) {

                const phase =

                    i * 2.17;

                const px =

                    centerX +

                    Math.sin(phase * 1.37) *

                    tubeWidth * (0.22 + (i % 3) * 0.035);

                const py =

                    liquidTop +

                    liquidHeight *

                    (0.16 + (i % 6) * 0.145);

                const rx =

                    tubeWidth *

                    (0.16 + (i % 4) * 0.025) *

                    (0.45 + 0.55 * coagulationAmount);

                const ry =

                    (7 + (i % 4) * 3) *

                    (0.55 + 0.45 * coagulationAmount);

                macroCtx.fillStyle =

                    `rgba(255,255,255,${0.20 + coagulationAmount * 0.42})`;

                macroCtx.beginPath();

                macroCtx.ellipse(

                    px,

                    py,

                    rx,

                    ry,

                    phase * 0.18,

                    0,

                    Math.PI * 2

                );

                macroCtx.fill();

            }

            /*

               Viền và mặt gel rõ hơn khi đã đông tụ mạnh, nhưng

               vẫn giữ bề mặt hơi mềm thay vì biến thành một khối cứng.

            */

            const surfaceLift =

                2 +

                coagulationAmount * 5;

            macroCtx.strokeStyle =

                `rgba(255,255,255,${0.55 + coagulationAmount * 0.35})`;

            macroCtx.lineWidth =

                1.6 +

                coagulationAmount * 1.1;

            macroCtx.beginPath();

            macroCtx.moveTo(

                left + 6,

                liquidTop + surfaceLift

            );

            macroCtx.quadraticCurveTo(

                centerX - tubeWidth * 0.20,

                liquidTop - surfaceLift * 0.28,

                centerX,

                liquidTop + surfaceLift * 0.18

            );

            macroCtx.quadraticCurveTo(

                centerX + tubeWidth * 0.20,

                liquidTop - surfaceLift * 0.28,

                left + tubeWidth - 6,

                liquidTop + surfaceLift

            );

            macroCtx.stroke();

        }

        drawInternalBubbles(

            centerX,

            liquidTop,

            liquidHeight,

            tubeWidth,

            internalBubbleAmount

        );

        drawFoam(

            centerX,

            liquidTop,

            tubeWidth,

            foamAmount

        );

    }

    /* =====================================================

       THÂN THỦY TINH

    ===================================================== */

    const glass =

        macroCtx.createLinearGradient(

            left,

            0,

            left + tubeWidth,

            0

        );

    glass.addColorStop(

        0,

        "rgba(165,210,200,0.18)"

    );

    glass.addColorStop(

        0.28,

        "rgba(255,255,255,0.70)"

    );

    glass.addColorStop(

        0.50,

        "rgba(220,242,235,0.20)"

    );

    glass.addColorStop(

        0.78,

        "rgba(255,255,255,0.60)"

    );

    glass.addColorStop(

        1,

        "rgba(160,205,195,0.25)"

    );

    macroCtx.fillStyle =

        glass;

    macroCtx.strokeStyle =

        "rgba(75,112,101,0.68)";

    macroCtx.lineWidth =

        2;

    macroCtx.beginPath();

    macroCtx.moveTo(

        left,

        top

    );

    macroCtx.lineTo(

        left,

        bottom -

        tubeWidth / 2

    );

    macroCtx.quadraticCurveTo(

        left,

        bottom,

        centerX,

        bottom

    );

    macroCtx.quadraticCurveTo(

        left + tubeWidth,

        bottom,

        left + tubeWidth,

        bottom -

        tubeWidth / 2

    );

    macroCtx.lineTo(

        left + tubeWidth,

        top

    );

    macroCtx.closePath();

    macroCtx.fill();

    macroCtx.stroke();

    /* =====================================================

       MIỆNG ỐNG NGHIỆM

    ===================================================== */

    macroCtx.fillStyle =

        "rgba(245,252,249,0.72)";

    macroCtx.beginPath();

    macroCtx.ellipse(

        centerX,

        top,

        tubeWidth / 2,

        6,

        0,

        0,

        Math.PI * 2

    );

    macroCtx.fill();

    macroCtx.stroke();

    /* ánh sáng trên thành ống */

    macroCtx.strokeStyle =

        "rgba(255,255,255,0.82)";

    macroCtx.lineWidth =

        3;

    macroCtx.beginPath();

    macroCtx.moveTo(

        left + 9,

        top + 18

    );

    macroCtx.lineTo(

        left + 9,

        bottom - 28

    );

    macroCtx.stroke();

}

/* =========================================================

   BỌT TRẮNG TRÊN BỀ MẶT

========================================================= */

function drawFoam(

    centerX,

    liquidTop,

    tubeWidth,

    amount

) {

    if (

        amount <= 0

    ) {

        return;

    }

    const foamHeight =

        4 +

        amount * 20;

    const foamTop =

        liquidTop -

        foamHeight;

    /* lớp bọt trắng dày trên bề mặt */

    macroCtx.fillStyle =

        "rgba(255,255,255,0.94)";

    macroCtx.beginPath();

    macroCtx.moveTo(

        centerX - tubeWidth * 0.44,

        liquidTop

    );

    macroCtx.quadraticCurveTo(

        centerX - tubeWidth * 0.36,

        foamTop + 7,

        centerX - tubeWidth * 0.24,

        foamTop + 4

    );

    macroCtx.quadraticCurveTo(

        centerX - tubeWidth * 0.12,

        foamTop - 2,

        centerX,

        foamTop + 3

    );

    macroCtx.quadraticCurveTo(

        centerX + tubeWidth * 0.13,

        foamTop - 3,

        centerX + tubeWidth * 0.25,

        foamTop + 4

    );

    macroCtx.quadraticCurveTo(

        centerX + tubeWidth * 0.37,

        foamTop + 7,

        centerX + tubeWidth * 0.44,

        liquidTop

    );

    macroCtx.closePath();

    macroCtx.fill();

    const bubbleCount =

        Math.floor(

            6 +

            amount * 20

        );

    for (

        let i = 0;

        i < bubbleCount;

        i++

    ) {

        const phase =

            i * 1.37;

        const bx =

            centerX +

            Math.sin(

                time * 1.1 +

                phase

            ) *

            tubeWidth *

            0.34;

        const by =

            liquidTop -

            2 -

            (i % 6) * 2.7 -

            Math.abs(

                Math.sin(

                    time * 1.4 +

                    phase

                )

            ) *

            foamHeight *

            0.70;

        const radius =

            2.2 +

            (i % 4) * 1.35;

        macroCtx.fillStyle =

            "rgba(255,255,255,0.97)";

        macroCtx.beginPath();

        macroCtx.arc(

            bx,

            by,

            radius,

            0,

            Math.PI * 2

        );

        macroCtx.fill();

        macroCtx.strokeStyle =

            "rgba(225,225,215,0.75)";

        macroCtx.lineWidth =

            1;

        macroCtx.stroke();

    }

}

/* =========================================================

   BONG BÓNG NHỎ BÊN TRONG LÒNG TRẮNG

========================================================= */

function drawInternalBubbles(

    centerX,

    liquidTop,

    liquidHeight,

    tubeWidth,

    amount

) {

    if (

        amount <= 0

    ) {

        return;

    }

    const bubbleCount =

        Math.floor(

            6 +

            amount * 18

        );

    for (

        let i = 0;

        i < bubbleCount;

        i++

    ) {

        const phase =

            i * 2.13;

        const bx =

            centerX +

            Math.sin(

                time * 0.9 +

                phase

            ) *

            tubeWidth *

            0.30;

        const rise =

            (

                time *

                (3 + amount * 2) +

                i * 17

            ) %

            (liquidHeight * 0.78);

        const by =

            liquidTop +

            liquidHeight -

            8 -

            rise;

        const radius =

            2 +

            (i % 4) * 1.1;

        macroCtx.fillStyle =

            "rgba(255,255,255,0.78)";

        macroCtx.strokeStyle =

            "rgba(205,205,190,0.72)";

        macroCtx.lineWidth =

            1;

        macroCtx.beginPath();

        macroCtx.arc(

            bx,

            by,

            radius,

            0,

            Math.PI * 2

        );

        macroCtx.fill();

        macroCtx.stroke();

    }

}

/* =========================================================

   GIÁ ĐỠ ỐNG NGHIỆM

========================================================= */

function drawStand() {

    const standX =

        macroW * 0.17;

    const tubeCenterX =

        macroW * 0.50;

    const tubeWidth =

        macroW * 0.095;

    const tubeLeft =

        tubeCenterX -

        tubeWidth / 2;

    const tubeRight =

        tubeCenterX +

        tubeWidth / 2;

    /* =====================================================

       ĐẾ GIÁ

    ===================================================== */

    const baseLeft =

        standX - 72;

    const baseRight =

        tubeCenterX + 72;

    const baseY =

        macroH * 0.825;

    const baseHeight =

        27;

    addShadow(

        macroCtx,

        8,

        0.16

    );

    const base =

        macroCtx.createLinearGradient(

            baseLeft,

            0,

            baseRight,

            0

        );

    base.addColorStop(

        0,

        "#354d46"

    );

    base.addColorStop(

        0.5,

        "#526a61"

    );

    base.addColorStop(

        1,

        "#354d46"

    );

    macroCtx.fillStyle =

        base;

    roundedRect(

        macroCtx,

        baseLeft,

        baseY,

        baseRight - baseLeft,

        baseHeight,

        7

    );

    macroCtx.fill();

    removeShadow(

        macroCtx

    );

    /* =====================================================

       TRỤ ĐỨNG

    ===================================================== */

    const pole =

        macroCtx.createLinearGradient(

            standX - 9,

            0,

            standX + 9,

            0

        );

    pole.addColorStop(

        0,

        "#61756d"

    );

    pole.addColorStop(

        0.48,

        "#a4b3ae"

    );

    pole.addColorStop(

        1,

        "#50645d"

    );

    macroCtx.fillStyle =

        pole;

    roundedRect(

        macroCtx,

        standX - 8,

        macroH * 0.14,

        16,

        baseY -

        macroH * 0.14,

        7

    );

    macroCtx.fill();

    /* =====================================================

       THANH NGANG

    ===================================================== */

    const barStart =

        standX;

    const barEnd =

        tubeLeft - 10;

    macroCtx.fillStyle =

        "#64746e";

    roundedRect(

        macroCtx,

        barStart,

        macroH * 0.275,

        barEnd - barStart,

        14,

        6

    );

    macroCtx.fill();

    /* =====================================================

       CỤM KẸP

    ===================================================== */

    const clampY =

        macroH * 0.282;

    const clampLeft =

        tubeLeft - 40;

    const clampWidth =

        tubeWidth + 72;

    macroCtx.fillStyle =

        "#525f5a";

    roundedRect(

        macroCtx,

        clampLeft,

        clampY - 20,

        clampWidth,

        40,

        8

    );

    macroCtx.fill();

    /* núm kẹp */

    macroCtx.fillStyle =

        "#3f4d48";

    roundedRect(

        macroCtx,

        clampLeft - 21,

        clampY - 10,

        22,

        20,

        4

    );

    macroCtx.fill();

    /* ngàm trên */

    macroCtx.strokeStyle =

        "#75837d";

    macroCtx.lineWidth =

        7;

    macroCtx.lineCap =

        "round";

    macroCtx.beginPath();

    macroCtx.moveTo(

        tubeLeft - 2,

        clampY - 2

    );

    macroCtx.lineTo(

        tubeLeft + 13,

        clampY - 11

    );

    macroCtx.lineTo(

        tubeRight + 2,

        clampY - 11

    );

    macroCtx.stroke();

    /* ngàm dưới */

    macroCtx.beginPath();

    macroCtx.moveTo(

        tubeLeft - 2,

        clampY + 2

    );

    macroCtx.lineTo(

        tubeLeft + 13,

        clampY + 11

    );

    macroCtx.lineTo(

        tubeRight + 2,

        clampY + 11

    );

    macroCtx.stroke();

    /* đầu kẹp phủ lên thành ống */

    macroCtx.fillStyle =

        "#596862";

    roundedRect(

        macroCtx,

        tubeRight - 7,

        clampY - 15,

        18,

        30,

        5

    );

    macroCtx.fill();

}

/* =========================================================

   ĐÈN CỒN

========================================================= */

function drawAlcoholLamp() {

    const centerX = macroW * 0.50;

    const y = macroH * 0.765;


    /* bóng đổ */

    macroCtx.fillStyle = "rgba(35,50,45,0.14)";

    macroCtx.beginPath();

    macroCtx.ellipse(centerX, y + 44, 58, 9, 0, 0, Math.PI * 2);

    macroCtx.fill();


    /* thân đèn thủy tinh */

    const body = macroCtx.createLinearGradient(centerX - 45, 0, centerX + 45, 0);

    body.addColorStop(0, "rgba(135,190,200,0.72)");

    body.addColorStop(0.18, "rgba(235,249,250,0.90)");

    body.addColorStop(0.50, "rgba(255,255,255,0.94)");

    body.addColorStop(0.78, "rgba(214,239,242,0.82)");

    body.addColorStop(1, "rgba(125,181,192,0.68)");

    macroCtx.fillStyle = body;

    macroCtx.strokeStyle = "rgba(75,125,132,0.72)";

    macroCtx.lineWidth = 2;

    addShadow(macroCtx, 8, 0.14);

    roundedRect(macroCtx, centerX - 45, y, 90, 43, 17);

    macroCtx.fill();

    macroCtx.stroke();

    removeShadow(macroCtx);


    /* cồn bên trong bình */

    const alcoholTop = y + 27;

    const alcohol = macroCtx.createLinearGradient(0, alcoholTop, 0, y + 41);

    alcohol.addColorStop(0, "rgba(226,239,238,0.78)");

    alcohol.addColorStop(0.45, "rgba(182,214,214,0.84)");

    alcohol.addColorStop(1, "rgba(118,165,172,0.90)");

    macroCtx.fillStyle = alcohol;

    macroCtx.beginPath();

    macroCtx.moveTo(centerX - 36, alcoholTop);

    macroCtx.lineTo(centerX + 36, alcoholTop);

    macroCtx.lineTo(centerX + 34, y + 37);

    macroCtx.quadraticCurveTo(centerX, y + 42, centerX - 34, y + 37);

    macroCtx.closePath();

    macroCtx.fill();

    macroCtx.strokeStyle = "rgba(255,255,255,0.72)";

    macroCtx.lineWidth = 1.2;

    macroCtx.beginPath();

    macroCtx.ellipse(centerX, alcoholTop, 34, 3.2, 0, 0, Math.PI * 2);

    macroCtx.stroke();


    /* bấc bằng sợi cotton: chạy xuyên qua nắp và xuống trong phần cồn */

    macroCtx.save();

    macroCtx.strokeStyle = "rgba(91,74,58,0.82)";

    macroCtx.lineWidth = 4.2;

    macroCtx.lineCap = "round";

    macroCtx.beginPath();

    macroCtx.moveTo(centerX, y - 25);

    macroCtx.bezierCurveTo(centerX - 0.8, y - 7, centerX + 0.8, y + 10, centerX, y + 33);

    macroCtx.stroke();

    /* vài sợi sáng nhỏ tạo cảm giác bấc bện */

    macroCtx.strokeStyle = "rgba(238,221,190,0.55)";

    macroCtx.lineWidth = 0.8;

    macroCtx.beginPath();

    macroCtx.moveTo(centerX - 1.1, y - 24);

    macroCtx.bezierCurveTo(centerX - 1.8, y - 6, centerX + 1.5, y + 12, centerX - 0.6, y + 31);

    macroCtx.stroke();

    macroCtx.restore();


    /* cổ đèn và nắp giữ bấc */

    const neck = macroCtx.createLinearGradient(centerX - 11, 0, centerX + 11, 0);

    neck.addColorStop(0, "#3b4542");

    neck.addColorStop(0.5, "#89938f");

    neck.addColorStop(1, "#353e3b");

    macroCtx.fillStyle = neck;

    roundedRect(macroCtx, centerX - 11, y - 20, 22, 20, 5);

    macroCtx.fill();

    macroCtx.fillStyle = "#3e4744";

    roundedRect(macroCtx, centerX - 14, y - 24, 28, 6, 3);

    macroCtx.fill();


    /* phần bấc lộ ra khỏi nắp */

    macroCtx.strokeStyle = "#3a3028";

    macroCtx.lineWidth = 4;

    macroCtx.lineCap = "round";

    macroCtx.beginPath();

    macroCtx.moveTo(centerX, y - 24);

    macroCtx.lineTo(centerX, y - 34);

    macroCtx.stroke();


    drawFlame(centerX, y - 36);

}

/* =========================================================

   NGỌN LỬA

========================================================= */

function drawFlame(x, y) {

    const heat = Math.max(0, Math.min(temperature / 100, 1));

    if (heat <= 0.001) return;


    /* Ngọn lửa nhiều lớp, mỗi lớp biến dạng riêng để chuyển động tự nhiên. */

    const pulse = 0.92 + 0.10 * Math.sin(time * 7.1);

    const sway = Math.sin(time * 4.8) * (1.2 + heat * 1.8) + Math.sin(time * 12.6) * 0.9;

    const tipX = sway + Math.sin(time * 9.4) * (1.5 + heat * 1.4);

    const h = (30 + heat * 25) * pulse;

    const w = 11 + heat * 10;


    macroCtx.save();

    macroCtx.translate(x, y);


    const glow = macroCtx.createRadialGradient(0, -h * 0.38, 1, 0, -h * 0.38, 34 + heat * 18);

    glow.addColorStop(0, `rgba(255,185,70,${0.12 + heat * 0.12})`);

    glow.addColorStop(1, 'rgba(255,185,70,0)');

    macroCtx.fillStyle = glow;

    macroCtx.beginPath();

    macroCtx.arc(0, -h * 0.38, 34 + heat * 18, 0, Math.PI * 2);

    macroCtx.fill();


    /* vùng xanh sát bấc */

    macroCtx.fillStyle = 'rgba(80,165,205,0.88)';

    macroCtx.beginPath();

    macroCtx.moveTo(-w * 0.42, 2);

    macroCtx.bezierCurveTo(-w * 0.30, -5, -w * 0.16, -9, 0, -13);

    macroCtx.bezierCurveTo(w * 0.17, -9, w * 0.30, -4, w * 0.42, 2);

    macroCtx.bezierCurveTo(w * 0.18, 6, -w * 0.18, 6, -w * 0.42, 2);

    macroCtx.fill();


    /* thân lửa ngoài */

    const outer = macroCtx.createLinearGradient(0, 4, 0, -h);

    outer.addColorStop(0, '#f7b33f');

    outer.addColorStop(0.34, '#f28a27');

    outer.addColorStop(0.78, '#ed7622');

    outer.addColorStop(1, '#d95d1c');

    macroCtx.fillStyle = outer;

    macroCtx.beginPath();

    macroCtx.moveTo(-w * 0.48, 4);

    macroCtx.bezierCurveTo(-w * 1.05, -3, -w * 1.02, -h * 0.25, -w * 0.56, -h * 0.46);

    macroCtx.bezierCurveTo(-w * 0.25, -h * 0.62, -w * 0.36, -h * 0.78, tipX, -h);

    macroCtx.bezierCurveTo(tipX + w * 0.10, -h * 0.78, w * 0.92, -h * 0.55, w * 0.70, -h * 0.30);

    macroCtx.bezierCurveTo(w * 0.56, -h * 0.13, w * 0.82, -2, w * 0.40, 4);

    macroCtx.bezierCurveTo(w * 0.14, 8, -w * 0.18, 8, -w * 0.48, 4);

    macroCtx.fill();


    /* lõi vàng lệch nhẹ và thay đổi độc lập */

    const ix = Math.sin(time * 6.4) * 1.2;

    macroCtx.fillStyle = '#ffe477';

    macroCtx.beginPath();

    macroCtx.moveTo(-w * 0.30 + ix, 3);

    macroCtx.bezierCurveTo(-w * 0.48, -4, -w * 0.42, -h * 0.20, -w * 0.12, -h * 0.38);

    macroCtx.bezierCurveTo(w * 0.05, -h * 0.50, w * 0.02, -h * 0.63, tipX * 0.72, -h * 0.70);

    macroCtx.bezierCurveTo(w * 0.46, -h * 0.48, w * 0.48, -h * 0.20, w * 0.27, 1);

    macroCtx.bezierCurveTo(w * 0.12, 5, -w * 0.10, 5, -w * 0.30 + ix, 3);

    macroCtx.fill();


    /* vùng sáng ở chân lửa */

    macroCtx.fillStyle = 'rgba(255,250,205,0.94)';

    macroCtx.beginPath();

    macroCtx.ellipse(ix * 0.4, -1, 2.5 + heat * 0.8, 5.5 + heat * 1.5, 0, 0, Math.PI * 2);

    macroCtx.fill();


    /* nhánh lửa nhỏ thay đổi hình dạng */

    if (heat > 0.28) {

        const tongue = Math.sin(time * 10.8);

        macroCtx.fillStyle = 'rgba(255,154,40,0.82)';

        macroCtx.beginPath();

        macroCtx.moveTo(w * 0.18, -h * 0.28);

        macroCtx.bezierCurveTo(w * 0.55, -h * 0.40, w * 0.42, -h * 0.58, w * 0.18 + tongue * 1.8, -h * 0.66);

        macroCtx.bezierCurveTo(w * 0.28, -h * 0.49, w * 0.08, -h * 0.42, w * 0.18, -h * 0.28);

        macroCtx.fill();

    }


    macroCtx.restore();

}

function drawEggWhiteCup() {

    const centerX = macroW * 0.80;

    const top = macroH * 0.66;

    const width = macroW * 0.19;

    const height = macroH * 0.25;


    macroCtx.fillStyle = 'rgba(40,60,53,0.14)';

    macroCtx.beginPath();

    macroCtx.ellipse(centerX, top + height + 6, width * 0.48, 9, 0, 0, Math.PI * 2);

    macroCtx.fill();


    const egg = macroCtx.createLinearGradient(0, top + height * 0.40, 0, top + height);

    egg.addColorStop(0, '#fff9d9');

    egg.addColorStop(1, '#e8dc9b');

    macroCtx.fillStyle = egg;

    macroCtx.beginPath();

    macroCtx.moveTo(centerX - width * 0.44, top + height * 0.43);

    macroCtx.quadraticCurveTo(centerX, top + height * 0.36, centerX + width * 0.44, top + height * 0.43);

    macroCtx.lineTo(centerX + width * 0.40, top + height - 8);

    macroCtx.quadraticCurveTo(centerX, top + height + 2, centerX - width * 0.40, top + height - 8);

    macroCtx.closePath();

    macroCtx.fill();


    const glass = macroCtx.createLinearGradient(centerX - width / 2, 0, centerX + width / 2, 0);

    glass.addColorStop(0, 'rgba(110,190,225,0.16)');

    glass.addColorStop(0.30, 'rgba(255,255,255,0.52)');

    glass.addColorStop(0.50, 'rgba(220,245,250,0.22)');

    glass.addColorStop(0.72, 'rgba(255,255,255,0.50)');

    glass.addColorStop(1, 'rgba(100,180,220,0.18)');

    macroCtx.fillStyle = glass;

    macroCtx.strokeStyle = 'rgba(70,175,220,0.58)';

    macroCtx.lineWidth = 2;

    macroCtx.beginPath();

    macroCtx.moveTo(centerX - width / 2, top + 5);

    macroCtx.lineTo(centerX - width * 0.43, top + height);

    macroCtx.quadraticCurveTo(centerX, top + height + 6, centerX + width * 0.43, top + height);

    macroCtx.lineTo(centerX + width / 2, top + 5);

    macroCtx.closePath();

    macroCtx.fill();

    macroCtx.stroke();


    /* Miệng cốc: không vẽ oval kín nên sẽ không còn đường kẻ chạy giữa miệng cốc. */

    macroCtx.save();

    macroCtx.strokeStyle = 'rgba(75,155,195,0.68)';

    macroCtx.lineWidth = 2.4;

    macroCtx.beginPath();

    macroCtx.ellipse(centerX, top + 4, width * 0.49, 8.5, 0, Math.PI, Math.PI * 2);

    macroCtx.stroke();

    macroCtx.strokeStyle = 'rgba(255,255,255,0.92)';

    macroCtx.lineWidth = 1.3;

    macroCtx.beginPath();

    macroCtx.ellipse(centerX, top + 3, width * 0.43, 5.2, 0, Math.PI, Math.PI * 2);

    macroCtx.stroke();

    macroCtx.restore();


    /* Tờ giấy dán: rộng và cao hơn, chữ luôn nằm hoàn toàn trên giấy. */

    const labelW = width * 0.86;

    const labelH = 48;

    const labelX = centerX - labelW / 2;

    const labelY = top + height * 0.49;


    macroCtx.save();

    macroCtx.shadowColor = 'rgba(30,50,45,0.16)';

    macroCtx.shadowBlur = 4;

    macroCtx.shadowOffsetY = 2;

    macroCtx.fillStyle = '#fffdf7';

    macroCtx.strokeStyle = 'rgba(145,145,135,0.62)';

    macroCtx.lineWidth = 1.1;

    roundedRect(macroCtx, labelX, labelY, labelW, labelH, 3);

    macroCtx.fill();

    macroCtx.stroke();

    macroCtx.restore();


    macroCtx.save();

    macroCtx.beginPath();

    macroCtx.rect(labelX + 3, labelY + 3, labelW - 6, labelH - 6);

    macroCtx.clip();

    macroCtx.fillStyle = '#43504d';

    macroCtx.textAlign = 'center';

    macroCtx.textBaseline = 'middle';

    macroCtx.font = '600 13px Arial, sans-serif';

    macroCtx.fillText('Lòng trắng', centerX, labelY + 17);

    macroCtx.fillText('trứng', centerX, labelY + 34);

    macroCtx.restore();

}


function getPipetteTipPosition() {

    const localX = 0;

    const localY = 227;

    const cos =

        Math.cos(

            pipette.angle

        );

    const sin =

        Math.sin(

            pipette.angle

        );

    return {

        x:

            pipette.x +

            localX * cos -

            localY * sin,

        y:

            pipette.y +

            localX * sin +

            localY * cos

    };

}

/* =========================================================

   KIỂM TRA ĐẦU PIPETTE ĐANG Ở CỐC

========================================================= */

function isPipetteOverCup() {

    const tip =

        getPipetteTipPosition();

    const cupX =

        macroW * 0.80;

    const cupTop =

        macroH * 0.66;

    const cupWidth =

        macroW * 0.19;

    const cupHeight =

        macroH * 0.25;

    return (

        tip.x >

        cupX - cupWidth * 0.52 &&

        tip.x <

        cupX + cupWidth * 0.52 &&

        tip.y >

        cupTop + cupHeight * 0.25 &&

        tip.y <

        cupTop + cupHeight + 20

    );

}

/* =========================================================

   KIỂM TRA ĐẦU PIPETTE Ở MIỆNG ỐNG NGHIỆM

========================================================= */

function isPipetteOverTube() {

    const tip =

        getPipetteTipPosition();

    const tubeCenterX =

        macroW * 0.50;

    const tubeWidth =

        macroW * 0.095;

    const tubeTop =

        macroH * 0.25;

    return (

        tip.x >

        tubeCenterX - tubeWidth * 0.70 &&

        tip.x <

        tubeCenterX + tubeWidth * 0.70 &&

        tip.y >

        tubeTop - 30 &&

        tip.y <

        tubeTop + 45

    );

}

/* =========================================================

   HÚT LÒNG TRẮNG VÀO PIPETTE

========================================================= */

function suckEggWhite() {

    if (

        !isPipetteOverCup()

    ) {

        return;

    }

    const suckAmount =

        0.08;

    pipetteEggWhite =

        Math.min(

            0.40,

            pipetteEggWhite +

            suckAmount

        );

}

/* =========================================================

   THẢ LÒNG TRẮNG TỪ PIPETTE VÀO ỐNG NGHIỆM

========================================================= */

function releaseEggWhite() {

    if (

        pipetteEggWhite <= 0

    ) {

        return;

    }

    if (

        !isPipetteOverTube()

    ) {

        return;

    }

    eggWhiteAmount +=

        pipetteEggWhite;

    eggWhiteAmount =

        Math.min(

            eggWhiteAmount,

            0.65

        );

    pipetteEggWhite =

        0;

}

/* =========================================================

   PIPETTE

========================================================= */

function drawPipette() {

    macroCtx.save();

    macroCtx.translate(

        pipette.x,

        pipette.y

    );

    macroCtx.rotate(

        pipette.angle

    );

    addShadow(

        macroCtx,

        9,

        0.18

    );

    /* =====================================================

       BẦU CAO SU

    ===================================================== */

    const bulb =

        macroCtx.createLinearGradient(

            -23,

            0,

            24,

            0

        );

    bulb.addColorStop(

        0,

        "#3c64aa"

    );

    bulb.addColorStop(

        0.45,

        "#75a9ed"

    );

    bulb.addColorStop(

        1,

        "#3862a8"

    );

    macroCtx.fillStyle =

        bulb;

    macroCtx.beginPath();

    macroCtx.roundRect(

        -23,

        -8,

        46,

        58,

        18

    );

    macroCtx.fill();

    removeShadow(

        macroCtx

    );

    /* cổ */

    macroCtx.fillStyle =

        "#3565a8";

    macroCtx.fillRect(

        -13,

        43,

        26,

        11

    );

    /* =====================================================

       THÂN THỦY TINH

    ===================================================== */

    const glass =

        macroCtx.createLinearGradient(

            -12,

            0,

            12,

            0

        );

    glass.addColorStop(

        0,

        "rgba(165,215,205,0.25)"

    );

    glass.addColorStop(

        0.45,

        "rgba(255,255,255,0.80)"

    );

    glass.addColorStop(

        1,

        "rgba(165,210,202,0.25)"

    );

    macroCtx.fillStyle =

        glass;

    macroCtx.strokeStyle =

        "rgba(65,105,96,0.68)";

    macroCtx.lineWidth =

        2;

    macroCtx.beginPath();

    macroCtx.roundRect(

        -10,

        49,

        20,

        135,

        4

    );

    macroCtx.fill();

    macroCtx.stroke();

    /* =====================================================

       LÒNG TRẮNG TRONG PIPETTE

    ===================================================== */

    if (

        pipetteEggWhite > 0

    ) {

        const liquidHeight =

            62 *

            (

                pipetteEggWhite /

                0.40

            );

        macroCtx.fillStyle =

            "#efe5b5";

        macroCtx.beginPath();

        macroCtx.roundRect(

            -7,

            153 - liquidHeight,

            14,

            liquidHeight,

            5

        );

        macroCtx.fill();

    }

    /* =====================================================

       ĐẦU NHỌN

    ===================================================== */

    macroCtx.fillStyle =

        "rgba(235,244,240,0.50)";

    macroCtx.beginPath();

    macroCtx.moveTo(

        -6,

        181

    );

    macroCtx.lineTo(

        -2,

        224

    );

    macroCtx.lineTo(

        2,

        224

    );

    macroCtx.lineTo(

        6,

        181

    );

    macroCtx.closePath();

    macroCtx.fill();

    macroCtx.stroke();

    /* =====================================================

       GIỌT CHỈ XUẤT HIỆN KHI CÓ LÒNG TRẮNG

    ===================================================== */

    if (

        pipetteEggWhite > 0

    ) {

        macroCtx.fillStyle =

            "#eee4b4";

        macroCtx.beginPath();

        macroCtx.moveTo(

            0,

            227

        );

        macroCtx.bezierCurveTo(

            -7,

            235,

            -7,

            243,

            0,

            247

        );

        macroCtx.bezierCurveTo(

            7,

            243,

            7,

            235,

            0,

            227

        );

        macroCtx.fill();

    }

    macroCtx.restore();

}

/* =========================================================

   VẼ TOÀN BỘ MỨC VĨ MÔ

========================================================= */

function drawMacro() {

    macroCtx.clearRect(

        0,

        0,

        macroW,

        macroH

    );

    drawBackground();

    drawTestTube();

    drawStand();

    drawAlcoholLamp();

    drawEggWhiteCup();

    drawPipette();

}

/* =========================================================

   PROTEIN VI MÔ – MÔ HÌNH GIẢN LƯỢC PHỤC VỤ DẠY HỌC

   - Mỗi chuỗi dài là một protein/chuỗi polypeptide được biểu diễn giản lược.

   - Không biểu diễn từng nguyên tử hay cấu trúc phân tử thật.

   - Nhiệt tăng -> cấu hình protein thay đổi dần (biến tính).

   - Một số đoạn đỏ quy ước là vùng kị nước được lộ ra rõ hơn khi biến tính.

   - Sau biến tính, các protein tiếp xúc tại nhiều vị trí và tập hợp thành

     một mạng không đều; các điểm nối chỉ xuất hiện ở vùng tiếp xúc gần.

========================================================= */

let microDenaturation = 0;

let microAggregation = 0;

/* =========================================================

   TẠO PROTEIN

========================================================= */

function createProtein(x, y, scale, color) {

    proteins.push({

        x,

        y,

        homeX: x,

        homeY: y,

        vx: (Math.random() - 0.5) * 0.28,

        vy: (Math.random() - 0.5) * 0.28,

        angle: Math.random() * Math.PI * 2,

        rotation: (Math.random() - 0.5) * 0.005,

        scale,

        color,

        phase: Math.random() * Math.PI * 2,

        /* Kích thước này là thang đo trực quan, không phải kích thước thật. */

        size: 30 + Math.random() * 3,

        /* 0 = gấp cuộn tương đối compact; 1 = mở/biến đổi cấu hình rõ. */

        unfold: 0,

        /* Mức độ tập hợp vào mạng protein. */

        aggregation: 0,

        /* Vị trí đích trong mạng mở, không phải một điểm hút chung. */

        networkX: x,

        networkY: y,

        networkIndex: 0,

        vibration: Math.random() * Math.PI * 2,

        wobble: Math.random() * Math.PI * 2

    });

}

/* =========================================================

   TẠO HỆ PROTEIN

========================================================= */

function createProteins() {

    proteins.length = 0;

    proteinLinks.length = 0;

    waterParticles.length = 0;

    microDenaturation = 0;

    microAggregation = 0;

    /* Ban đầu các protein phân bố rộng, chuyển động độc lập. */

    const startPositions = [

        [0.15, 0.23], [0.34, 0.18], [0.53, 0.21], [0.73, 0.26],

        [0.22, 0.43], [0.43, 0.39], [0.63, 0.43], [0.80, 0.49],

        [0.16, 0.67], [0.36, 0.73], [0.57, 0.68], [0.76, 0.72]

    ];

    startPositions.forEach((pos, i) => {

        createProtein(

            microW * pos[0] + (Math.random() - 0.5) * 12,

            microH * pos[1] + (Math.random() - 0.5) * 10,

            0.92 + Math.random() * 0.08,

            proteinColors[i % proteinColors.length]

        );

    });

    /*

       Mạng cuối được bố trí như một cấu trúc mở nhiều tầng.

       Khoảng cách đủ gần để các chuỗi dài có thể tiếp xúc,

       nhưng không dồn tất cả thành một búi ở giữa.

    */

    const networkLayout = [

        [-122, -58], [-58, -88], [12, -78], [82, -48],

        [-108,  8],  [-38, -10], [34,  -2], [105,  20],

        [-86,  68],  [-18,  78], [50,  68], [108,  82]

    ];

    proteins.forEach((p, i) => {

        p.networkIndex = i;

        p.networkX = microW * 0.50 + networkLayout[i][0];

        p.networkY = microH * 0.50 + networkLayout[i][1];

    });

    /* Các điểm nền chỉ tạo cảm giác môi trường nước, không phải nguyên tử. */

    for (let i = 0; i < 18; i++) {

        waterParticles.push({

            x: microW * (0.10 + Math.random() * 0.80),

            y: microH * (0.10 + Math.random() * 0.80),

            phase: Math.random() * Math.PI * 2,

            size: 1.2 + Math.random() * 0.8

        });

    }

}

/* =========================================================

   HÌNH HỌC CHUỖI PROTEIN

   Protein ban đầu là một chuỗi dài nhưng gấp cuộn compact.

   Khi nhiệt tăng, chuỗi mở/đổi cấu hình dần và vẫn uốn cong.

========================================================= */

function getProteinPoints(p) {

    const count = 25;

    const r = p.size;

    /*

       Cấu hình gấp cuộn: chuỗi đi vòng qua nhiều đoạn,

       tạo một cấu trúc compact chứ không phải một dãy thẳng.

    */

    const folded = [

        [-0.72, -0.04], [-0.78, -0.46], [-0.52, -0.78], [-0.08, -0.88],

        [ 0.36, -0.74], [ 0.70, -0.48], [ 0.78, -0.08], [ 0.60,  0.28],

        [ 0.24,  0.56], [-0.18,  0.62], [-0.56,  0.46], [-0.70,  0.12],

        [-0.40, -0.12], [-0.02, -0.30], [ 0.34, -0.18], [ 0.46,  0.14],

        [ 0.20,  0.34], [-0.16,  0.24], [-0.38,  0.02], [-0.18, -0.52],

        [ 0.16, -0.62], [ 0.48, -0.42], [ 0.54, -0.02], [ 0.28,  0.20],

        [-0.04,  0.06]

    ];

    /*

       Khi biến tính, chuỗi dài ra rõ rệt nhưng vẫn gấp khúc/uốn lượn.

       Đây là biểu diễn quy ước của sự thay đổi cấu hình, không phải

       hình học phân tử chính xác.

    */

    const opened = [];

    const openedLength = r * 3.55;

    for (let i = 0; i < count; i++) {

        const t = i / (count - 1);

        const x = -openedLength / 2 + t * openedLength;

        const y =

            Math.sin(p.phase + t * Math.PI * 2.15 + time * 0.28) * r * 0.48 +

            Math.sin(p.phase * 0.62 + t * Math.PI * 4.25 + time * 0.17) * r * 0.18 +

            Math.sin(t * Math.PI * 1.15 + p.phase) * r * 0.12;

        opened.push({ x, y });

    }

    const points = [];

    for (let i = 0; i < count; i++) {

        const f = folded[i];

        const o = opened[i];

        const u = p.unfold;

        points.push({

            x: f[0] * r * (1 - u) + o.x * u,

            y: f[1] * r * (1 - u) + o.y * u

        });

    }

    return points;

}

function getWorldProteinPoints(p) {

    const localPoints = getProteinPoints(p);

    const cos = Math.cos(p.angle);

    const sin = Math.sin(p.angle);

    return localPoints.map(point => ({

        x: p.x + (point.x * p.scale * cos - point.y * p.scale * sin),

        y: p.y + (point.x * p.scale * sin + point.y * p.scale * cos)

    }));

}

/* =========================================================

   VÙNG KỊ NƯỚC – KÝ HIỆU TRỰC QUAN

   Các vùng đỏ là những đoạn được quy ước để minh họa vùng

   kị nước lộ ra rõ hơn khi protein bị biến tính; không phải nguyên tử.

========================================================= */

function isHydrophobicIndex(index) {

    return (

        (index >= 3 && index <= 5) ||

        (index >= 11 && index <= 13) ||

        (index >= 19 && index <= 21)

    );

}

function getHydrophobicPoints(p) {

    const points = getWorldProteinPoints(p);

    return points

        .map((point, index) => ({ point, index }))

        .filter(item => isHydrophobicIndex(item.index));

}

/* =========================================================

   VẼ CHUỖI PROTEIN

========================================================= */

function drawSmoothChain(points) {

    if (points.length < 2) return;

    microCtx.beginPath();

    microCtx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {

        const midX = (points[i].x + points[i + 1].x) / 2;

        const midY = (points[i].y + points[i + 1].y) / 2;

        microCtx.quadraticCurveTo(

            points[i].x,

            points[i].y,

            midX,

            midY

        );

    }

    const last = points[points.length - 1];

    microCtx.quadraticCurveTo(

        last.x,

        last.y,

        last.x,

        last.y

    );

    microCtx.stroke();

}

function drawHydrophobicPatch(points, index, alpha) {

    const prev = points[Math.max(0, index - 1)];

    const current = points[index];

    const next = points[Math.min(points.length - 1, index + 1)];

    if (!prev || !current || !next) return;

    const startX = prev.x * 0.42 + current.x * 0.58;

    const startY = prev.y * 0.42 + current.y * 0.58;

    const endX = current.x * 0.58 + next.x * 0.42;

    const endY = current.y * 0.58 + next.y * 0.42;

    microCtx.strokeStyle = `rgba(204,78,78,${alpha})`;

    microCtx.lineWidth = 7.8;

    microCtx.lineCap = "round";

    microCtx.beginPath();

    microCtx.moveTo(startX, startY);

    microCtx.lineTo(endX, endY);

    microCtx.stroke();

}

function drawProtein(p) {

    const points = getWorldProteinPoints(p);

    const baseWidth = 7.0 * p.scale;

    microCtx.save();

    microCtx.lineCap = "round";

    microCtx.lineJoin = "round";

    /* Bóng rất nhẹ để chuỗi có chiều sâu. */

    microCtx.strokeStyle = "rgba(48,86,118,0.10)";

    microCtx.lineWidth = baseWidth + 2.4;

    drawSmoothChain(points);

    /* Chuỗi protein chính. */

    microCtx.strokeStyle = p.color || "#78aee5";

    microCtx.lineWidth = baseWidth;

    drawSmoothChain(points);

    /*

       Khi biến tính tăng, các đoạn kị nước được làm nổi rõ hơn.

       Chúng vẫn là một phần của chuỗi, không phải các hạt rời.

    */

    const exposure = 0.04 + p.unfold * 0.88;

    for (let index = 0; index < points.length; index++) {

        if (!isHydrophobicIndex(index)) continue;

        drawHydrophobicPatch(

            points,

            index,

            0.08 + exposure * 0.76

        );

    }

    /* Một vài điểm sáng rất nhỏ để giữ cảm giác chuỗi liên tục. */

    points.forEach((point, index) => {

        if (isHydrophobicIndex(index)) return;

        if (index % 2 !== 0) return;

        microCtx.fillStyle = "rgba(255,255,255,0.48)";

        microCtx.beginPath();

        microCtx.arc(

            point.x,

            point.y,

            0.9 * p.scale,

            0,

            Math.PI * 2

        );

        microCtx.fill();

    });

    microCtx.restore();

}

/* =========================================================

   LIÊN KẾT / ĐIỂM TIẾP XÚC

   Chỉ biểu diễn sự tiếp xúc/tương tác giữa các vùng trên protein.

   Không gán đây là một loại liên kết hóa học cụ thể.

========================================================= */

function hasProteinLink(a, b) {

    return proteinLinks.some(link =>

        (link.a === a && link.b === b) ||

        (link.a === b && link.b === a)

    );

}

function createProteinLink(a, b, indexA, indexB) {

    if (hasProteinLink(a, b)) return;

    proteinLinks.push({

        a,

        b,

        indexA,

        indexB,

        phase: Math.random() * Math.PI * 2

    });

}

function findClosestHydrophobicContact(a, b) {

    const pointsA = getHydrophobicPoints(a);

    const pointsB = getHydrophobicPoints(b);

    let bestDistance = Infinity;

    let bestIndexA = -1;

    let bestIndexB = -1;

    pointsA.forEach(itemA => {

        pointsB.forEach(itemB => {

            const dx = itemB.point.x - itemA.point.x;

            const dy = itemB.point.y - itemA.point.y;

            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < bestDistance) {

                bestDistance = d;

                bestIndexA = itemA.index;

                bestIndexB = itemB.index;

            }

        });

    });

    return {

        distance: bestDistance,

        indexA: bestIndexA,

        indexB: bestIndexB

    };

}

function updateProteinLinks() {

    proteinLinks.forEach(link => {

        const pointsA = getWorldProteinPoints(link.a);

        const pointsB = getWorldProteinPoints(link.b);

        const a = pointsA[link.indexA];

        const b = pointsB[link.indexB];

        if (!a || !b) return;

        const dx = b.x - a.x;

        const dy = b.y - a.y;

        const d = Math.sqrt(dx * dx + dy * dy) || 1;

        const preferred = 8.5;

        if (d > preferred) {

            const nx = dx / d;

            const ny = dy / d;

            const pull = Math.min(

                0.028,

                (d - preferred) * 0.0022

            ) * (0.50 + microAggregation * 0.82);

            link.a.vx += nx * pull;

            link.a.vy += ny * pull;

            link.b.vx -= nx * pull;

            link.b.vy -= ny * pull;

        }

    });

}

/* =========================================================

   TƯƠNG TÁC PROTEIN

========================================================= */

function handleProteinInteractions() {

    for (let i = 0; i < proteins.length; i++) {

        for (let j = i + 1; j < proteins.length; j++) {

            const a = proteins[i];

            const b = proteins[j];

            const dx = b.x - a.x;

            const dy = b.y - a.y;

            const distance = Math.sqrt(dx * dx + dy * dy) || 1;

            const minDistance =

                (a.size * a.scale * 0.78) +

                (b.size * b.scale * 0.78);

            /* Trước khi tập hợp, các protein va chạm và đổi hướng. */

            if (distance < minDistance) {

                const nx = dx / distance;

                const ny = dy / distance;

                const overlap = minDistance - distance;

                const repulsion =

                    microAggregation > 0.55 ? 0.12 : 0.24;

                a.x -= nx * overlap * 0.5 * repulsion;

                a.y -= ny * overlap * 0.5 * repulsion;

                b.x += nx * overlap * 0.5 * repulsion;

                b.y += ny * overlap * 0.5 * repulsion;

                const relativeVelocity =

                    (b.vx - a.vx) * nx +

                    (b.vy - a.vy) * ny;

                if (relativeVelocity < 0) {

                    const impulse = relativeVelocity * 0.34;

                    a.vx += impulse * nx;

                    a.vy += impulse * ny;

                    b.vx -= impulse * nx;

                    b.vy -= impulse * ny;

                }

            }

            /*

               Khi biến tính đủ rõ, vùng kị nước lộ ra hơn.

               Nếu hai vùng tiến gần nhau, có xác suất hình thành

               một điểm tương tác và được giữ gần nhau trong mạng.

            */

            if (

                microAggregation > 0.18 &&

                a.unfold > 0.24 &&

                b.unfold > 0.24 &&

                !hasProteinLink(a, b)

            ) {

                const contact = findClosestHydrophobicContact(a, b);

                const contactDistance =

                    11 + microAggregation * 18;

                if (contact.distance < contactDistance) {

                    const probability =

                        0.010 + microAggregation * 0.050;

                    if (Math.random() < probability) {

                        createProteinLink(

                            a,

                            b,

                            contact.indexA,

                            contact.indexB

                        );

                    }

                }

            }

        }

    }

}

/* =========================================================

   CHUYỂN ĐỘNG VÀ BIẾN TÍNH

========================================================= */

function updateProteins() {

    /*

       Khi chưa có lòng trắng trứng trong ống nghiệm, mức vi mô

       được giữ ở trạng thái ban đầu: tăng thanh nhiệt độ không

       làm protein biến tính hay tạo mạng.

       Chỉ sau khi lòng trắng đã được đưa vào ống nghiệm,

       nhiệt độ mới tác động lên mô hình vi mô.

    */

    const microTemperature =

        eggWhiteAmount > 0 ? temperature : 0;

    /*

       Các khoảng nhiệt ở đây chỉ là quy ước trực quan cho mô phỏng.

       Chúng tạo chuyển tiếp liên tục, không phải ngưỡng tuyệt đối.

    */

    const unfoldTarget = Math.max(

        0,

        Math.min(1, (microTemperature - 42) / 32)

    );

    const smoothUnfold =

        unfoldTarget * unfoldTarget * (3 - 2 * unfoldTarget);

    const aggregationTarget = Math.max(

        0,

        Math.min(1, (microTemperature - 55) / 35)

    );

    const smoothAggregation =

        aggregationTarget * aggregationTarget * (3 - 2 * aggregationTarget);

    microDenaturation +=

        (smoothUnfold - microDenaturation) * 0.035;

    microAggregation +=

        (smoothAggregation - microAggregation) * 0.025;

    proteins.forEach(p => {

        p.unfold += (smoothUnfold - p.unfold) * 0.045;

        p.aggregation += (smoothAggregation - p.aggregation) * 0.032;

        /* Chuyển động nhiệt tăng liên tục theo nhiệt độ. */

        const thermalStrength =

            0.004 + microTemperature * 0.00030;

        p.vx += (Math.random() - 0.5) * thermalStrength;

        p.vy += (Math.random() - 0.5) * thermalStrength;

        /*

           Khi tập hợp tăng, protein hướng tới vị trí lân cận trong mạng.

           Các vị trí khác nhau tạo mạng mở thay vì một búi trung tâm.

        */

        if (p.aggregation > 0.10) {

            const dx = p.networkX - p.x;

            const dy = p.networkY - p.y;

            const networkPull =

                0.00008 + p.aggregation * 0.00082;

            p.vx += dx * networkPull;

            p.vy += dy * networkPull;

        }

        /* Dao động riêng, không đồng bộ. */

        p.vx +=

            Math.sin(time * 1.7 + p.phase) *

            0.0016 * (0.4 + microTemperature / 100);

        p.vy +=

            Math.cos(time * 1.5 + p.wobble) *

            0.0016 * (0.4 + microTemperature / 100);

        const damping =

            0.989 - p.aggregation * 0.004;

        p.vx *= damping;

        p.vy *= damping;

        const maxSpeed =

            0.34 + microTemperature * 0.0055;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        if (speed > maxSpeed) {

            p.vx = p.vx / speed * maxSpeed;

            p.vy = p.vy / speed * maxSpeed;

        }

        p.x += p.vx;

        p.y += p.vy;

        /* Xoay chậm; khi mạng hình thành, xoay giảm nhưng không bằng 0. */

        p.angle +=

            p.rotation *

            (0.8 + microTemperature * 0.009) *

            (1 - p.aggregation * 0.40);

        const margin = 48;

        if (p.x < margin) {

            p.x = margin;

            p.vx = Math.abs(p.vx);

        }

        if (p.x > microW - margin) {

            p.x = microW - margin;

            p.vx = -Math.abs(p.vx);

        }

        if (p.y < margin) {

            p.y = margin;

            p.vy = Math.abs(p.vy);

        }

        if (p.y > microH - margin) {

            p.y = microH - margin;

            p.vy = -Math.abs(p.vy);

        }

    });

    handleProteinInteractions();

    updateProteinLinks();

    updateNetworkPositions();

}

/* =========================================================

   DAO ĐỘNG NHẸ CỦA MẠNG VÀ NỀN

========================================================= */

function updateNetworkPositions() {

    /* Mạng đã hình thành vẫn dao động cục bộ nhẹ. */

    proteins.forEach(p => {

        if (p.aggregation < 0.55) return;

        const localVibration =

            0.14 + p.aggregation * 0.07;

        p.x +=

            Math.sin(time * 2.1 + p.vibration) *

            localVibration * 0.10;

        p.y +=

            Math.cos(time * 1.9 + p.vibration) *

            localVibration * 0.10;

    });

    waterParticles.forEach(water => {

        water.x +=

            Math.sin(time * 1.4 + water.phase) * 0.035;

        water.y +=

            Math.cos(time * 1.2 + water.phase) * 0.035;

        water.x = Math.max(8, Math.min(microW - 8, water.x));

        water.y = Math.max(8, Math.min(microH - 8, water.y));

    });

}

/* =========================================================

   NỀN VI MÔ

========================================================= */

function drawMicroBackground() {

    const bg = microCtx.createRadialGradient(

        microW * 0.5,

        microH * 0.45,

        10,

        microW * 0.5,

        microH * 0.45,

        microW * 0.78

    );

    bg.addColorStop(0, "#ffffff");

    bg.addColorStop(0.68, "#f7faf9");

    bg.addColorStop(1, "#edf3f0");

    microCtx.fillStyle = bg;

    microCtx.fillRect(0, 0, microW, microH);

}

/* =========================================================

   MẠNG TƯƠNG TÁC GIỮA CÁC PROTEIN

========================================================= */

function drawProteinLinks() {

    proteinLinks.forEach(link => {

        const pointsA = getWorldProteinPoints(link.a);

        const pointsB = getWorldProteinPoints(link.b);

        const a = pointsA[link.indexA];

        const b = pointsB[link.indexB];

        if (!a || !b) return;

        const dx = b.x - a.x;

        const dy = b.y - a.y;

        const d = Math.sqrt(dx * dx + dy * dy) || 1;

        /* Chỉ vẽ khi điểm tiếp xúc vẫn gần nhau. */

        if (d > 14) return;

        const nx = -dy / d;

        const ny = dx / d;

        const bend = Math.min(1.6, d * 0.12);

        microCtx.strokeStyle =

            `rgba(78,116,143,${0.42 + microAggregation * 0.24})`;

        microCtx.lineWidth = 1.65;

        microCtx.lineCap = "round";

        microCtx.beginPath();

        microCtx.moveTo(a.x, a.y);

        microCtx.quadraticCurveTo(

            (a.x + b.x) / 2 + nx * bend,

            (a.y + b.y) / 2 + ny * bend,

            b.x,

            b.y

        );

        microCtx.stroke();

        /* Chấm tiếp xúc nhỏ để mắt nhận ra nơi hai chuỗi tương tác. */

        const pulse =

            0.30 +

            (Math.sin(time * 2.0 + link.phase) + 1) * 0.07;

        microCtx.fillStyle =

            `rgba(78,116,143,${pulse})`;

        microCtx.beginPath();

        microCtx.arc(

            (a.x + b.x) / 2,

            (a.y + b.y) / 2,

            1.45,

            0,

            Math.PI * 2

        );

        microCtx.fill();

    });

}

/* =========================================================

   HẠT NỀN RẤT NHẸ

========================================================= */

function drawWaterParticles() {

    if (microAggregation < 0.76) return;

    const alpha = Math.min(

        0.20,

        (microAggregation - 0.76) * 0.75

    );

    waterParticles.forEach(water => {

        microCtx.fillStyle =

            `rgba(125,190,214,${alpha})`;

        microCtx.beginPath();

        microCtx.arc(

            water.x,

            water.y,

            water.size,

            0,

            Math.PI * 2

        );

        microCtx.fill();

    });

}

/* =========================================================

   VẼ VI MÔ

========================================================= */

function drawMicro() {

    microCtx.clearRect(

        0,

        0,

        microW,

        microH

    );

    drawMicroBackground();

    drawWaterParticles();

    if (microAggregation > 0.18) {

        drawProteinLinks();

    }

    /* Vẽ mạng trước, protein sau để các chuỗi vẫn nổi rõ. */

    proteins.forEach(drawProtein);

}

/* =========================================================

   CẬP NHẬT BỌT – BONG BÓNG – ĐÔNG TỤ

========================================================= */

function updateCoagulation() {

    if (

        eggWhiteAmount <= 0

    ) {

        foamAmount = 0;

        internalBubbleAmount = 0;

        coagulationAmount = 0;

        return;

    }

    /*

       Khi đã có lòng trắng trong ống nghiệm, đông tụ tăng dần

       theo nhiệt độ. Không dùng một ngưỡng bật/tắt đột ngột.

       Khoảng 60–70°C được dùng như vùng minh họa cho quá trình

       biến tính/đông tụ của lòng trắng trứng.

    */

    let targetCoagulation =

        0;

    if (

        temperature >= 60

    ) {

        targetCoagulation =

            (

                temperature - 60

            ) /

            10;

        targetCoagulation =

            Math.max(

                0,

                Math.min(

                    targetCoagulation,

                    1

                )

            );

    }

    /*

       Chỉ giữ một lượng bọt rất nhỏ như yếu tố phụ của hình ảnh.

       Đông tụ được thể hiện chủ yếu bằng độ đục và gel trắng,

       không đồng nhất bọt với đông tụ.

    */

    const targetFoam =

        temperature >= 68

            ? 0.08

            : 0;

    let targetInternalBubbles =

        0;

    if (

        temperature >= 62

    ) {

        targetInternalBubbles =

            (

                temperature - 62

            ) /

            8;

        targetInternalBubbles =

            Math.min(

                targetInternalBubbles,

                1

            );

    }

    foamAmount +=

        (

            targetFoam -

            foamAmount

        ) *

        0.045;

    internalBubbleAmount +=

        (

            targetInternalBubbles -

            internalBubbleAmount

        ) *

        0.04;

    coagulationAmount +=

        (

            targetCoagulation -

            coagulationAmount

        ) *

        0.045;

}

/* =========================================================

   LẤY VỊ TRÍ CHUỘT

========================================================= */

function getPointerPosition(event) {

    const rect =

        macroCanvas.getBoundingClientRect();

    return {

        x:

            event.clientX -

            rect.left,

        y:

            event.clientY -

            rect.top

    };

}

/* =========================================================

   KIỂM TRA CHUỘT CÓ ĐANG Ở PIPETTE

========================================================= */

function isInsidePipette(

    x,

    y

) {

    const dx =

        x -

        pipette.x;

    const dy =

        y -

        pipette.y;

    const cos =

        Math.cos(

            pipette.angle

        );

    const sin =

        Math.sin(

            pipette.angle

        );

    const localX =

        dx * cos +

        dy * sin;

    const localY =

        -dx * sin +

        dy * cos;

    return (

        localX > -45 &&

        localX < 45 &&

        localY > -25 &&

        localY < 250

    );

}

/* =========================================================

   KÉO + NHẤN PIPETTE

========================================================= */

macroCanvas.addEventListener(

    "pointerdown",

    function(event) {

        const pos =

            getPointerPosition(

                event

            );

        if (

            isInsidePipette(

                pos.x,

                pos.y

            )

        ) {

            if (

                isPipetteOverCup()

            ) {

                suckEggWhite();

            }

            else if (

                isPipetteOverTube()

            ) {

                releaseEggWhite();

            }

            pipette.dragging =

                true;

            pipette.offsetX =

                pos.x -

                pipette.x;

            pipette.offsetY =

                pos.y -

                pipette.y;

            macroCanvas.setPointerCapture(

                event.pointerId

            );

        }

    }

);

/* =========================================================

   KÉO PIPETTE

========================================================= */

macroCanvas.addEventListener(

    "pointermove",

    function(event) {

        if (

            !pipette.dragging

        ) {

            return;

        }

        const pos =

            getPointerPosition(

                event

            );

        pipette.x =

            pos.x -

            pipette.offsetX;

        pipette.y =

            pos.y -

            pipette.offsetY;

        pipette.x =

            Math.max(

                50,

                Math.min(

                    macroW - 50,

                    pipette.x

                )

            );

        pipette.y =

            Math.max(

                -180,

                Math.min(

                    macroH - 80,

                    pipette.y

                )

            );

    }

);

/* =========================================================

   DỪNG KÉO

========================================================= */

macroCanvas.addEventListener(

    "pointerup",

    function() {

        pipette.dragging =

            false;

    }

);

macroCanvas.addEventListener(

    "pointercancel",

    function() {

        pipette.dragging =

            false;

    }

);

/* =========================================================

   THANH NHIỆT ĐỘ

========================================================= */

temperatureSlider.addEventListener(

    "input",

    function() {

        temperature =

            Number(

                this.value

            );

    }

);

/* =========================================================

   RESET

========================================================= */

resetButton.addEventListener(

    "click",

    function() {

        temperature =

            0;

        eggWhiteAmount =

            0;

        pipetteEggWhite =

            0;

        foamAmount =

            0;

        internalBubbleAmount =

            0;

        coagulationAmount =

            0;

        temperatureSlider.value =

            0;

        resetPipette();

        createProteins();

    }

);

/* =========================================================

   VÒNG LẶP ANIMATION

========================================================= */

function animate() {

    time +=

        0.016;

    updateProteins();

    updateCoagulation();

    drawMacro();

    drawMicro();

    requestAnimationFrame(

        animate

    );

}

/* =========================================================

   KHỞI ĐỘNG

========================================================= */

window.addEventListener(

    "resize",

    function() {

        resizeCanvases();

        resetPipette();

        createProteins();

    }

);

resizeCanvases();

resetPipette();

createProteins();

animate();

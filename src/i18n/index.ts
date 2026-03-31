export type Locale = "zh" | "en";

export type LocalizedString = { zh: string; en: string };

export type Translations = {
  ui: {
    searchPlaceholder: string;
    noToolsFound: string;
    loadingTool: string;
    welcomeSubtitle: string;
    welcomeHint: string;
  };
  categories: {
    text: string;
    codec: string;
    convert: string;
    generate: string;
    crypto: string;
    other: string;
  };
  tools: {
    base64: {
      encode: string;
      decode: string;
      input: string;
      output: string;
      inputEncodePlaceholder: string;
      inputDecodePlaceholder: string;
      outputPlaceholder: string;
      processFailed: string;
    };
    base64Image: {
      encodeTab: string;
      decodeTab: string;
      selectFile: string;
      chooseImage: string;
      readFileFailed: string;
      unsupportedType: string;
      invalidBase64: string;
      imagePreview: string;
      base64Result: string;
      inputBase64: string;
      inputBase64Placeholder: string;
      renderFailed: string;
    };
    timestamp: {
      currentTime: string;
      tsToDate: string;
      dateToTs: string;
      tsPlaceholder: string;
      datePlaceholder: string;
      invalidTimestamp: string;
      invalidDateFormat: string;
    };
    uuid: {
      genOptions: string;
      type: string;
      v4Desc: string;
      v7Desc: string;
      nanoidDesc: string;
      count: string;
      uppercase: string;
      noDash: string;
      length: string;
      alphabet: string;
      generate: string;
      results: string;
    };
    jwt: {
      jwtToken: string;
      jwtPlaceholder: string;
      invalidJwt: string;
      parseFailed: string;
      headerSubtitle: string;
      expired: string;
      valid: string;
      expiry: string;
      issuedAt: string;
    };
    jsonFormatter: {
      format: string;
      compact: string;
      validate: string;
      escape: string;
      unescape: string;
      indent: string;
      input: string;
      output: string;
      rawString: string;
      jsonEscapedString: string;
      escapedString: string;
      unescapedString: string;
      invalidEscape: string;
      validJson: string;
      typeArray: string;
      parseFailed: string;
    };
    cryptoTools: {
      hashTab: string;
      hmacTab: string;
      aesTab: string;
      inputText: string;
      inputHashPlaceholder: string;
      computing: string;
      secret: string;
      secretPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      hmacResult: string;
      aesNote: string;
      encrypt: string;
      decrypt: string;
      aesKey: string;
      aesKeyPlaceholder: string;
      plaintext: string;
      ciphertext: string;
      encryptPlaceholder: string;
      decryptPlaceholder: string;
      processFailed: string;
    };
    csvJson: {
      csvInput: string;
      jsonInput: string;
      csvOutput: string;
      jsonOutput: string;
      inputPlaceholder: string;
    };
    hexAscii: {
      ascii2hex: string;
      hex2ascii: string;
      input: string;
      asciiPlaceholder: string;
      hexPlaceholder: string;
      uppercase: string;
      spaceSeparated: string;
      hexOutput: string;
      decOutput: string;
      binOutput: string;
      asciiOutput: string;
      invalidHex: string;
    };
    logParser: {
      inputPlaceholder: string;
      clear: string;
      noOutput: string;
      lines: string;
      parsed: string;
    };
    mermaid: {
      editor: string;
      preview: string;
      renderError: string;
      emptyPrompt: string;
    };
    plantuml: {
      editor: string;
      preview: string;
      renderError: string;
      emptyPrompt: string;
      loading: string;
    };
    qrcode: {
      generateTab: string;
      decodeTab: string;
      inputPlaceholder: string;
      errorLevel: string;
      size: string;
      download: string;
      scanPrompt: string;
      decodeResult: string;
      decodeFailed: string;
      readFileFailed: string;
    };
    randomString: {
      genOptions: string;
      length: string;
      count: string;
      upper: string;
      lower: string;
      digits: string;
      symbols: string;
      generate: string;
      results: string;
      noCharSet: string;
    };
    regexTester: {
      pattern: string;
      flags: string;
      globalFlag: string;
      ignoreCaseFlag: string;
      multilineFlag: string;
      testInput: string;
      testPlaceholder: string;
      results: string;
      matched: string;
      noMatch: string;
      invalidRegex: string;
    };
    rsaKeygen: {
      keySize: string;
      generate: string;
      generating: string;
      publicKey: string;
      privateKey: string;
    };
    sqlFormat: {
      dialect: string;
      input: string;
      output: string;
    };
    sqlPojo: {
      input: string;
      output: string;
      inputPlaceholder: string;
      className: string;
      packageName: string;
      useLombok: string;
      generateOptions: string;
    };
    textDiff: {
      leftPanel: string;
      rightPanel: string;
      leftPlaceholder: string;
      rightPlaceholder: string;
      diffResult: string;
      noDiff: string;
    };
    urlCodec: {
      encode: string;
      decode: string;
      input: string;
      output: string;
      inputEncodePlaceholder: string;
      inputDecodePlaceholder: string;
      outputPlaceholder: string;
      processFailed: string;
    };
    yamlJson: {
      yamlToJson: string;
      jsonToYaml: string;
      input: string;
      output: string;
      parseFailed: string;
    };
    cron: {
      expression: string;
      expressionPlaceholder: string;
      humanReadable: string;
      nextRuns: string;
      fields: string;
      fieldSecond: string;
      fieldMinute: string;
      fieldHour: string;
      fieldDay: string;
      fieldMonth: string;
      fieldWeekday: string;
      invalidExpression: string;
      visual: string;
      presets: string;
    };
  };
};

export const translations: Record<Locale, Translations> = {
  zh: {
    ui: {
      searchPlaceholder: "搜索工具... ⌘K",
      noToolsFound: "未找到工具",
      loadingTool: "加载中...",
      welcomeSubtitle: "插件化开发者工具集",
      welcomeHint: "从左侧选择一个工具开始使用",
    },
    categories: {
      text: "📋 文本",
      codec: "🔄 编解码",
      convert: "🕐 转换",
      generate: "🔧 生成",
      crypto: "🔐 加密",
      other: "⚙️ 其他",
    },
    tools: {
      base64: {
        encode: "编码",
        decode: "解码",
        input: "输入",
        output: "输出",
        inputEncodePlaceholder: "输入要编码的文本...",
        inputDecodePlaceholder: "输入 Base64 字符串...",
        outputPlaceholder: "结果将显示在这里...",
        processFailed: "处理失败",
      },
      base64Image: {
        encodeTab: "图片 → Base64",
        decodeTab: "Base64 → 图片",
        selectFile: "选择图片文件",
        chooseImage: "选择图片",
        readFileFailed: "读取文件失败",
        unsupportedType: "仅支持图片类型的 Data URI（png/jpeg/gif/webp/bmp/ico）",
        invalidBase64: "无效的 Base64 字符串",
        imagePreview: "图片预览",
        base64Result: "Base64 结果",
        inputBase64: "输入 Base64 字符串",
        inputBase64Placeholder: "支持 data:image/...;base64,... 格式或纯 Base64 字符串",
        renderFailed: "无法渲染图片，请确认 Base64 字符串有效",
      },
      timestamp: {
        currentTime: "当前时间",
        tsToDate: "时间戳 → 日期",
        dateToTs: "日期 → 时间戳",
        tsPlaceholder: "输入时间戳 (秒或毫秒)...",
        datePlaceholder: "输入日期 (如 2024-01-01 12:00:00)...",
        invalidTimestamp: "无效的时间戳",
        invalidDateFormat: "无效的日期格式",
      },
      uuid: {
        genOptions: "生成选项",
        type: "类型",
        v4Desc: "随机生成，符合 RFC 4122 标准",
        v7Desc: "基于时间戳（毫秒），字典序可排序，符合 RFC 9562 标准",
        nanoidDesc: "更短、URL 安全的唯一 ID，默认 21 字符",
        count: "数量:",
        uppercase: "大写",
        noDash: "无连字符",
        length: "长度:",
        alphabet: "字符集:",
        generate: "生成",
        results: "结果",
      },
      jwt: {
        jwtToken: "JWT Token",
        jwtPlaceholder: "粘贴 JWT Token（格式: xxxxx.yyyyy.zzzzz）...",
        invalidJwt: "无效的 JWT：需要恰好 3 个部分（header.payload.signature）",
        parseFailed: "解析失败：",
        headerSubtitle: "（算法 & 类型）",
        expired: "已过期",
        valid: "有效",
        expiry: "过期时间：",
        issuedAt: "签发时间：",
      },
      jsonFormatter: {
        format: "格式化",
        compact: "压缩",
        validate: "校验",
        escape: "转义",
        unescape: "反转义",
        indent: "缩进:",
        input: "输入",
        output: "输出",
        rawString: "原始字符串",
        jsonEscapedString: "JSON 转义字符串",
        escapedString: "转义后字符串",
        unescapedString: "反转义字符串",
        invalidEscape: "无效的 JSON 转义字符串",
        validJson: "✓ 有效的 JSON",
        typeArray: "数组",
        parseFailed: "JSON 解析失败",
      },
      cryptoTools: {
        hashTab: "哈希",
        hmacTab: "HMAC",
        aesTab: "AES 加解密",
        inputText: "输入文本",
        inputHashPlaceholder: "输入要计算哈希值的文本...",
        computing: "计算中...",
        secret: "密钥 (Secret)",
        secretPlaceholder: "输入密钥...",
        message: "消息 (Message)",
        messagePlaceholder: "输入消息...",
        hmacResult: "结果",
        aesNote:
          "使用 AES-GCM (256-bit) 加密，密钥截断或填充至 32 字节，输出为 Base64 (包含 IV)",
        encrypt: "加密",
        decrypt: "解密",
        aesKey: "密钥 (Key)",
        aesKeyPlaceholder: "输入加密密钥...",
        plaintext: "明文",
        ciphertext: "密文 (Base64)",
        encryptPlaceholder: "输入要加密的文本...",
        decryptPlaceholder: "输入 Base64 密文...",
        processFailed: "处理失败",
      },
      csvJson: {
        csvInput: "CSV 输入",
        jsonInput: "JSON 输入",
        csvOutput: "CSV 输出",
        jsonOutput: "JSON 输出",
        inputPlaceholder: "输入",
      },
      hexAscii: {
        ascii2hex: "ASCII → Hex",
        hex2ascii: "Hex → ASCII",
        input: "输入",
        asciiPlaceholder: "输入 ASCII 文本...",
        hexPlaceholder: "输入 Hex 字符串 (如: 48 65 6c 6c 6f)...",
        uppercase: "大写",
        spaceSeparated: "空格分隔",
        hexOutput: "Hex",
        decOutput: "Decimal",
        binOutput: "Binary",
        asciiOutput: "ASCII",
        invalidHex: "无效的 Hex 字符串",
      },
      logParser: {
        inputPlaceholder: "粘贴日志内容...",
        clear: "清空",
        noOutput: "解析结果将显示在这里",
        lines: "行",
        parsed: "已解析",
      },
      mermaid: {
        editor: "编辑器",
        preview: "预览",
        renderError: "渲染错误",
        emptyPrompt: "在左侧输入 Mermaid 代码",
      },
      plantuml: {
        editor: "编辑器",
        preview: "预览",
        renderError: "渲染错误",
        emptyPrompt: "在左侧输入 PlantUML 代码",
        loading: "渲染中...",
      },
      qrcode: {
        generateTab: "生成",
        decodeTab: "解析",
        inputPlaceholder: "输入要生成二维码的文本或 URL...",
        errorLevel: "容错级别:",
        size: "尺寸:",
        download: "下载",
        scanPrompt: "点击或拖放图片到此处解析二维码",
        decodeResult: "解析结果",
        decodeFailed: "无法识别二维码",
        readFileFailed: "读取文件失败",
      },
      randomString: {
        genOptions: "生成选项",
        length: "长度:",
        count: "数量:",
        upper: "大写 (A-Z)",
        lower: "小写 (a-z)",
        digits: "数字 (0-9)",
        symbols: "符号 (!@#…)",
        generate: "生成",
        results: "结果",
        noCharSet: "请至少选择一种字符集",
      },
      regexTester: {
        pattern: "正则表达式",
        flags: "标志",
        globalFlag: "全局匹配",
        ignoreCaseFlag: "忽略大小写",
        multilineFlag: "多行模式",
        testInput: "测试文本",
        testPlaceholder: "输入要测试的文本...",
        results: "匹配结果",
        matched: "个匹配",
        noMatch: "无匹配",
        invalidRegex: "无效的正则表达式",
      },
      rsaKeygen: {
        keySize: "密钥长度:",
        generate: "生成密钥对",
        generating: "生成中...",
        publicKey: "公钥 (Public Key)",
        privateKey: "私钥 (Private Key)",
      },
      sqlFormat: {
        dialect: "方言:",
        input: "输入 SQL",
        output: "格式化结果",
      },
      sqlPojo: {
        input: "CREATE TABLE SQL",
        output: "Java POJO",
        inputPlaceholder: "输入 CREATE TABLE SQL...",
        className: "类名:",
        packageName: "包名:",
        useLombok: "使用 Lombok",
        generateOptions: "生成选项",
      },
      textDiff: {
        leftPanel: "原始文本",
        rightPanel: "修改文本",
        leftPlaceholder: "输入原始文本...",
        rightPlaceholder: "输入修改后的文本...",
        diffResult: "差异结果",
        noDiff: "两段文本完全相同",
      },
      urlCodec: {
        encode: "编码",
        decode: "解码",
        input: "输入",
        output: "输出",
        inputEncodePlaceholder: "输入要编码的 URL...",
        inputDecodePlaceholder: "输入要解码的 URL...",
        outputPlaceholder: "结果将显示在这里...",
        processFailed: "处理失败",
      },
      yamlJson: {
        yamlToJson: "YAML → JSON",
        jsonToYaml: "JSON → YAML",
        input: "输入",
        output: "输出",
        parseFailed: "解析失败",
      },
      cron: {
        expression: "Cron 表达式",
        expressionPlaceholder: "输入 Cron 表达式 (如 0 0 * * *)...",
        humanReadable: "人类可读描述",
        nextRuns: "接下来运行时间",
        fields: "字段说明",
        fieldSecond: "秒",
        fieldMinute: "分",
        fieldHour: "时",
        fieldDay: "日",
        fieldMonth: "月",
        fieldWeekday: "周",
        invalidExpression: "无效的 Cron 表达式",
        visual: "可视化构建器",
        presets: "预设",
      },
    },
  },
  en: {
    ui: {
      searchPlaceholder: "Search tools... ⌘K",
      noToolsFound: "No tools found",
      loadingTool: "Loading...",
      welcomeSubtitle: "Pluggable Developer Toolkit",
      welcomeHint: "Select a tool from the sidebar to get started",
    },
    categories: {
      text: "📋 Text",
      codec: "🔄 Codec",
      convert: "🕐 Convert",
      generate: "🔧 Generate",
      crypto: "🔐 Crypto",
      other: "⚙️ Other",
    },
    tools: {
      base64: {
        encode: "Encode",
        decode: "Decode",
        input: "Input",
        output: "Output",
        inputEncodePlaceholder: "Enter text to encode...",
        inputDecodePlaceholder: "Enter Base64 string...",
        outputPlaceholder: "Result will appear here...",
        processFailed: "Processing failed",
      },
      base64Image: {
        encodeTab: "Image → Base64",
        decodeTab: "Base64 → Image",
        selectFile: "Select Image File",
        chooseImage: "Choose Image",
        readFileFailed: "Failed to read file",
        unsupportedType:
          "Only image Data URIs are supported (png/jpeg/gif/webp/bmp/ico)",
        invalidBase64: "Invalid Base64 string",
        imagePreview: "Image Preview",
        base64Result: "Base64 Result",
        inputBase64: "Input Base64 String",
        inputBase64Placeholder:
          "Supports data:image/...;base64,... format or plain Base64 string",
        renderFailed: "Failed to render image, please verify the Base64 string is valid",
      },
      timestamp: {
        currentTime: "Current Time",
        tsToDate: "Timestamp → Date",
        dateToTs: "Date → Timestamp",
        tsPlaceholder: "Enter timestamp (seconds or ms)...",
        datePlaceholder: "Enter date (e.g. 2024-01-01 12:00:00)...",
        invalidTimestamp: "Invalid timestamp",
        invalidDateFormat: "Invalid date format",
      },
      uuid: {
        genOptions: "Generation Options",
        type: "Type",
        v4Desc: "Randomly generated, RFC 4122 compliant",
        v7Desc: "Timestamp-based (ms), lexicographically sortable, RFC 9562 compliant",
        nanoidDesc: "Shorter, URL-safe unique ID, default 21 characters",
        count: "Count:",
        uppercase: "Uppercase",
        noDash: "No Hyphens",
        length: "Length:",
        alphabet: "Alphabet:",
        generate: "Generate",
        results: "Results",
      },
      jwt: {
        jwtToken: "JWT Token",
        jwtPlaceholder: "Paste JWT Token (format: xxxxx.yyyyy.zzzzz)...",
        invalidJwt: "Invalid JWT: must have exactly 3 parts (header.payload.signature)",
        parseFailed: "Parse failed: ",
        headerSubtitle: "(algorithm & type)",
        expired: "Expired",
        valid: "Valid",
        expiry: "Expiry: ",
        issuedAt: "Issued at: ",
      },
      jsonFormatter: {
        format: "Format",
        compact: "Compact",
        validate: "Validate",
        escape: "Escape",
        unescape: "Unescape",
        indent: "Indent:",
        input: "Input",
        output: "Output",
        rawString: "Raw String",
        jsonEscapedString: "JSON Escaped String",
        escapedString: "Escaped String",
        unescapedString: "Unescaped String",
        invalidEscape: "Invalid JSON escaped string",
        validJson: "✓ Valid JSON",
        typeArray: "Array",
        parseFailed: "JSON parse failed",
      },
      cryptoTools: {
        hashTab: "Hash",
        hmacTab: "HMAC",
        aesTab: "AES Encrypt/Decrypt",
        inputText: "Input Text",
        inputHashPlaceholder: "Enter text to compute hash...",
        computing: "Computing...",
        secret: "Secret Key",
        secretPlaceholder: "Enter secret key...",
        message: "Message",
        messagePlaceholder: "Enter message...",
        hmacResult: "Result",
        aesNote:
          "AES-GCM (256-bit) encryption, key truncated/padded to 32 bytes, output is Base64 (with IV)",
        encrypt: "Encrypt",
        decrypt: "Decrypt",
        aesKey: "Key",
        aesKeyPlaceholder: "Enter encryption key...",
        plaintext: "Plaintext",
        ciphertext: "Ciphertext (Base64)",
        encryptPlaceholder: "Enter text to encrypt...",
        decryptPlaceholder: "Enter Base64 ciphertext...",
        processFailed: "Processing failed",
      },
      csvJson: {
        csvInput: "CSV Input",
        jsonInput: "JSON Input",
        csvOutput: "CSV Output",
        jsonOutput: "JSON Output",
        inputPlaceholder: "Input",
      },
      hexAscii: {
        ascii2hex: "ASCII → Hex",
        hex2ascii: "Hex → ASCII",
        input: "Input",
        asciiPlaceholder: "Enter ASCII text...",
        hexPlaceholder: "Enter Hex string (e.g. 48 65 6c 6c 6f)...",
        uppercase: "Uppercase",
        spaceSeparated: "Space Separated",
        hexOutput: "Hex",
        decOutput: "Decimal",
        binOutput: "Binary",
        asciiOutput: "ASCII",
        invalidHex: "Invalid Hex string",
      },
      logParser: {
        inputPlaceholder: "Paste log content here...",
        clear: "Clear",
        noOutput: "Parsed results will appear here",
        lines: "lines",
        parsed: "parsed",
      },
      mermaid: {
        editor: "Editor",
        preview: "Preview",
        renderError: "Render Error",
        emptyPrompt: "Enter Mermaid code on the left",
      },
      plantuml: {
        editor: "Editor",
        preview: "Preview",
        renderError: "Render Error",
        emptyPrompt: "Enter PlantUML code on the left",
        loading: "Rendering...",
      },
      qrcode: {
        generateTab: "Generate",
        decodeTab: "Decode",
        inputPlaceholder: "Enter text or URL to generate QR code...",
        errorLevel: "Error Level:",
        size: "Size:",
        download: "Download",
        scanPrompt: "Click or drag an image here to decode QR code",
        decodeResult: "Decoded Result",
        decodeFailed: "Unable to recognize QR code",
        readFileFailed: "Failed to read file",
      },
      randomString: {
        genOptions: "Generation Options",
        length: "Length:",
        count: "Count:",
        upper: "Uppercase (A-Z)",
        lower: "Lowercase (a-z)",
        digits: "Digits (0-9)",
        symbols: "Symbols (!@#…)",
        generate: "Generate",
        results: "Results",
        noCharSet: "Please select at least one character set",
      },
      regexTester: {
        pattern: "Regex Pattern",
        flags: "Flags",
        globalFlag: "Global match",
        ignoreCaseFlag: "Ignore case",
        multilineFlag: "Multiline",
        testInput: "Test Input",
        testPlaceholder: "Enter text to test...",
        results: "Match Results",
        matched: "match(es)",
        noMatch: "No match",
        invalidRegex: "Invalid regex",
      },
      rsaKeygen: {
        keySize: "Key Size:",
        generate: "Generate Key Pair",
        generating: "Generating...",
        publicKey: "Public Key",
        privateKey: "Private Key",
      },
      sqlFormat: {
        dialect: "Dialect:",
        input: "Input SQL",
        output: "Formatted Result",
      },
      sqlPojo: {
        input: "CREATE TABLE SQL",
        output: "Java POJO",
        inputPlaceholder: "Enter CREATE TABLE SQL...",
        className: "Class Name:",
        packageName: "Package Name:",
        useLombok: "Use Lombok",
        generateOptions: "Generation Options",
      },
      textDiff: {
        leftPanel: "Original Text",
        rightPanel: "Modified Text",
        leftPlaceholder: "Enter original text...",
        rightPlaceholder: "Enter modified text...",
        diffResult: "Diff Result",
        noDiff: "Texts are identical",
      },
      urlCodec: {
        encode: "Encode",
        decode: "Decode",
        input: "Input",
        output: "Output",
        inputEncodePlaceholder: "Enter URL to encode...",
        inputDecodePlaceholder: "Enter URL to decode...",
        outputPlaceholder: "Result will appear here...",
        processFailed: "Processing failed",
      },
      yamlJson: {
        yamlToJson: "YAML → JSON",
        jsonToYaml: "JSON → YAML",
        input: "Input",
        output: "Output",
        parseFailed: "Parse failed",
      },
      cron: {
        expression: "Cron Expression",
        expressionPlaceholder: "Enter Cron expression (e.g. 0 0 * * *)...",
        humanReadable: "Human Readable Description",
        nextRuns: "Next Run Times",
        fields: "Field Reference",
        fieldSecond: "Second",
        fieldMinute: "Minute",
        fieldHour: "Hour",
        fieldDay: "Day",
        fieldMonth: "Month",
        fieldWeekday: "Weekday",
        invalidExpression: "Invalid Cron expression",
        visual: "Visual Builder",
        presets: "Presets",
      },
    },
  },
};

export function getT(locale: Locale): Translations {
  return translations[locale];
}

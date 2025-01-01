interface BlockData {
    id: string;
    type: string;
    content: string;
}
export async function AIsummary(BlockData: BlockData[]) : Promise<string> {
    const obj={"preset": "简洁，用三行来总结表达",'blocks':BlockData};
    const blocks = JSON.stringify(obj);
    console.log(blocks);
    let summary  : string = '';
    try {
        const response = await fetch('http://forfries.com:9999/ai/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: blocks
        });
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const AIresponse = await response.json();
        if (AIresponse && AIresponse.data && typeof AIresponse.data.summary === "string") {
            summary = AIresponse.data.summary;
            console.log(summary); // 输出: "string"
        } else {
            console.error("summary 不存在或不是字符串");
        }
        return summary;
    } catch (error) {
        console.error('Error sending data to API:', error);
        throw error;
    }
}
export async function AIPicture(BlockData: BlockData[]) : Promise<string> {
    const obj={"preset": "生成的图片符合描述",'blocks':BlockData};
    const blocks = JSON.stringify(obj);
    console.log(blocks);
    let ImageURL: string = '';
    try {
        const response = await fetch('http://forfries.com:9999/ai/image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: blocks
        });
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const AIresponse = await response.json();
        if (AIresponse && AIresponse.data && typeof AIresponse.data.imageUrl === "string") {
            ImageURL = AIresponse.data.imageUrl;
            console.log(ImageURL); // 输出: "string"
        } else {
            console.error("imageUrl 不存在或不是字符串");
        }
        return ImageURL;
    } catch (error) {
        console.error('Error sending data to API:', error);
        throw error;
    }
}
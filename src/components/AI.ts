interface BlockData {
    id: string;
    type: string;
    content: string;
}
export async function AIsummary(BlockData: BlockData[]) {
    const blocks = JSON.stringify(BlockData);
    console.log(blocks);
    
    try {
        const response = await fetch('https://apifoxmock.com/m1/5580270-5258205-default/ai/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: blocks
        });
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
         const result = await response.json();
         console.log(result);
        return result;
    } catch (error) {
        console.error('Error sending data to API:', error);
        throw error;
    }
}
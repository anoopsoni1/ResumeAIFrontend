import { useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import axios from "axios";


export default function ResumeEditor() {
const editorRef = useRef(null);
const [editor, setEditor] = useState(null);


useEffect(() => {
const e = grapesjs.init({
container: editorRef.current,
height: "100vh",
storageManager: false,


blockManager: {
appendTo: "#blocks",
blocks: [
{ id: "section", label: "Section", content: "<section class='p-4'>New Section</section>" },
{ id: "text", label: "Text", content: "<p>Edit text</p>" },
{ id: "image", label: "Image", content: "<img src='https://via.placeholder.com/150'/>" },
{ id: "two-col", label: "2 Columns", content: "<div class='grid grid-cols-2 gap-4'><div>Col 1</div><div>Col 2</div></div>" }
]
}
});


setEditor(e);
}, []);


const saveResume = async () => {
const html = editor.getHtml();
const css = editor.getCss();


await axios.post("/api/resumes", { title: "My Resume", html, css });
alert("Saved!");
};


const downloadPDF = async () => {
const html = editor.getHtml();
const css = editor.getCss();


const res = await axios.post("/api/pdf", { html, css }, { responseType: "blob" });


const url = window.URL.createObjectURL(new Blob([res.data]));
const link = document.createElement("a");
link.href = url;
link.setAttribute("download", "resume.pdf");
document.body.appendChild(link);
link.click();
};


return (
<div className="flex">
<div id="blocks" className="w-64 border-r p-2 bg-white" />


<div className="flex-1">
<div className="p-2 border-b flex gap-2">
<button onClick={saveResume} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
<button onClick={downloadPDF} className="px-4 py-2 bg-blue-600 text-white rounded">Download PDF</button>
</div>


<div ref={editorRef} />
</div>
</div>
);
}
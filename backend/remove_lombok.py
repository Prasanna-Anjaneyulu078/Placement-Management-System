import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if 'lombok' not in content:
        return

    content = re.sub(r'import lombok\..*;\n', '', content)
    content = re.sub(r'@Data\n', '', content)
    content = re.sub(r'@NoArgsConstructor\n', '', content)
    content = re.sub(r'@AllArgsConstructor\n', '', content)
    content = re.sub(r'@Builder\n', '', content)

    class_match = re.search(r'public class (\w+)(.*?)\s*\{', content)
    if not class_match:
        return
    class_name = class_match.group(1)

    fields = re.findall(r'private\s+([\w<>]+)\s+(\w+)(?:\s*=\s*[^;]+)?\s*;', content)

    methods = ""
    methods += f"    public {class_name}() {{}}\n\n"
    
    if fields:
        params = ", ".join([f"{t} {n}" for t, n in fields])
        assignments = "\n".join([f"        this.{n} = {n};" for t, n in fields])
        methods += f"    public {class_name}({params}) {{\n{assignments}\n    }}\n\n"

    for t, n in fields:
        capitalized = n[0].upper() + n[1:]
        methods += f"    public {t} get{capitalized}() {{\n        return {n};\n    }}\n\n"
        methods += f"    public void set{capitalized}({t} {n}) {{\n        this.{n} = {n};\n    }}\n\n"

    last_brace_idx = content.rfind('}')
    if last_brace_idx != -1:
        content = content[:last_brace_idx] + methods + content[last_brace_idx:]

    with open(filepath, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk('src/main/java'):
    for file in files:
        if file.endswith('.java'):
            process_file(os.path.join(root, file))

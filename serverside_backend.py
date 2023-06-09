# imports
# notes: none
from transformers import AutoImageProcessor, ResNetForImageClassification
import torch
import torch.nn as nn
from PIL import Image
import numpy as np
import openai
print("DEBUG   --->   imported all libraries succesfully")

# declare neccesarry varables. api key for GPT3, cuda GPU.
# notes:
# 1: dont spam api key im paying for this shit
# 2: if CUDA GPU isnt found, it is possible to run on DEVICE, just change all the lines tagged with ^^ accordingly
openai.api_key = "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"

class_to_string = {0: "abrasion",
                   1: "allergic reaction",
                   2: "blister",
                   3: "bruise",
                   4: "mosquito or bug bite",
                   5: "burn",
                   6: "not visible from the outside",
                   7: "laceration or cut"}

# turn it into CPU or CUDA to force use one of them
force_device_use = "use auto detection"

if force_device_use == "use auto detection":
    print("DEBUG   --->   scanning devices")
    if torch.cuda.is_available() and force_device_use == "use auto detection":
        DEVICE = torch.device("cuda")
        print("DEBUG   --->   CUDA detected, running on GPU")
    else:
        DEVICE = torch.device("cpu")
        print("DEBUG   --->   CUDA not detected, running on CPU")
else:
    DEVICE = torch.device(force_device_use)
    print(f"DEBUG   --->   forced to use {force_device_use}, running on {force_device_use}")

# load the main classifier dummy (microsoft RESNET50) and change its output classifier head to have 8 neurones instead of 1000
main_classifier = ResNetForImageClassification.from_pretrained("microsoft/resnet-50")

main_classifier.classifier = torch.nn.Sequential(torch.nn.Flatten(start_dim=1, end_dim=-1),
                                     torch.nn.Linear(2048, 8))

main_classifier.to(DEVICE)
print("DEBUG   --->   loaded RESNET50 dummy")

# load both pretrained PTH files for the dummies, and apply them
# notes:
# 1: heres where you change the directory or the names of the files to whatever they are on your local system
# (refrences them if they are on the same folder as tthis file)
main_state_dict = torch.load(r"./main_classifier_chekpoint_8cls_78.750%acc.pth", map_location=torch.device('cpu'))
main_classifier.load_state_dict(main_state_dict)
print("DEBUG   --->   loaded pretrained weights + biases")

# moves both the yn classifier and the RESNET50 to the GPU
main_classifier.to(DEVICE)
print(f"DEBUG   --->   moved RESNET50 to {DEVICE}")

print(f"DEBUG   --->   {DEVICE} STATUS REPORT: omg im bout to blooooow im bussin")

# load the processor of the RESNET50
# notes:
# 1: thats the shit that takes in a PIL image, and convertas it to whatever the RESNET50 takes in
processor = AutoImageProcessor.from_pretrained("microsoft/resnet-50")
print("DEBUG   --->   loaded processor")

print("peter, _@#%*_)*..[[[]]] your horse is here")

def load_image(pil_image, mode):
    if mode == "pixels":
        img_array = np.array(pil_image)
        img_tensor = torch.tensor(img_array, dtype=torch.float32, device=DEVICE)
        return img_tensor.to(DEVICE)
    elif mode == "processor":
        return processor(pil_image, return_tensors="pt")["pixel_values"].to(DEVICE)

def main_classify(processor_image):
    prediction = main_classifier(processor_image).logits[0]
    most_likely = torch.argsort(prediction, descending=True)
    
    return prediction, (class_to_string[most_likely[0].item()],
                        class_to_string[most_likely[1].item()],
                        class_to_string[most_likely[2].item()])
    

def get_color(pixel_image):
    settings = {"special_color_conversion_threshold": 80,
                "darkness_pale_threshold": 170,
                "darkness_none_threshold": 90,
                "darkness_dark_threshold": 0}
    
    center_x, center_y = int(pixel_image.shape[0] / 2), int(pixel_image.shape[0] / 2)
    center_rgb = pixel_image[center_x][center_y]
    
    center_rgb = pixel_image[center_x][center_y]
    
    darkness = center_rgb.mean()
    indexes_by_mag = torch.argsort(center_rgb, descending=True)
    
    if torch.abs(center_rgb[indexes_by_mag[0]] - center_rgb[indexes_by_mag[1]]) <= settings["special_color_conversion_threshold"]:
        if (indexes_by_mag[0] == 0 and indexes_by_mag[1] == 1) or (indexes_by_mag[0] == 1 and indexes_by_mag[1] == 0):
            # yellow
            color = "skin colored"
        elif (indexes_by_mag[0] == 1 and indexes_by_mag[1] == 2) or (indexes_by_mag[0] == 2 and indexes_by_mag[1] == 1):
            # cyan
            color = "sickly blue"
        else:
            # pink
            color = "white-ish red"
    else:
        if indexes_by_mag[0] == 0:
            # red
            color = "red"
        elif indexes_by_mag[0] == 1:
            # green
            color = "green"
        else:
            # blue
            color = "blue"
    
    if darkness >= settings["darkness_dark_threshold"]:
        brightness = "dark"
    if darkness >= settings["darkness_none_threshold"]:
        brightness = ""
    if darkness >= settings["darkness_pale_threshold"]:
        brightness = "pale"
    
    return f"{brightness} {color}"

def gpt_completion(prompt, color, type, desc, bodypart, severity):
    prompt = prompt.replace("%CLR$", color).replace("%TYP0%", type[0]).replace("%TYP1%", type[1]).replace("%TYP2%", type[2]).replace("%DSC%", desc).replace("%SVR%", severity).replace("%BDP%", bodypart)
    
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        temperature=1.8,
        max_tokens=300,
        top_p=0.9,
        frequency_penalty=0.2,
        presence_penalty=0.5)["choices"][0]["text"]
    
    return response

def get_treatment(img, description, severity, bodypart, custom_prompt="default", pain_levels="default", bodypart_labels="default"):
    if custom_prompt == "default":
        custom_prompt = """I'm speaking to a doctor.
                           I got an injury, here is how I would describe it:
                           color: %CLR%
                           type: its most likely a %TYP0%, but it might be a %TYP1% or maybe a %TYP2%
                           description: "%DSC%"
                           estimated pain level: %SVR%
                           the bodypart affected: %BDP%
                           when curing, reference my description, and explain why the doctor chose each step
                           try curing everything yourself without using medical help
                           give me 5 expert steps to cure it. make it specified for the estimated pain level and the estimated type of the wound:"""

    if pain_levels == "default":
        pain_levels = {0: "No pain at all",
                       1: "Very mild pain (barely noticeable)",
                       2: "Mild pain (discomforting but can be ignored)",
                       3: "Moderate pain (interferes with daily activities)",
                       4: "Moderate to severe pain (limits daily activities)",
                       5: "Severe pain, might require pain relief medication (unable to perform daily activies)",
                       6: "Severe to excruciating pain, need pain relief medication immediatly (disrupts sleep)",
                       7: "Excruciating pain, need to go to the doctor (unable to concentrate on anything else)",
                       8: "Intense pain, need to go to the emergency room (causes nausea and vomiting)",
                       9: "Very intense pain, paramedics are required immediatly (causes physical shock)",
                       10: "Worst pain imaginable, paramedics are required immediatly (unbearable and may lead to unconsciousness)"}
    
    if bodypart_labels == "default":
        bodypart_labels = {1: "head",
                           2: "torso",
                           3: "arm",
                           4: "hand",
                           5: "arm",
                           6: "hand",
                           7: "chest",
                           8: "leg",
                           9: "foot"}
    
    color = get_color(load_image(img, "pixels"))
    classifier = main_classify(load_image(img, "processor"))
    wound_types = classifier[1]
    if max(classifier[0]) > 0:
        prediction = torch.relu(classifier[0]) / max(classifier[0])
    else:
        prediction = torch.relu(classifier[0])
    
    treatment = gpt_completion(custom_prompt, color, wound_types, description, bodypart_labels[bodypart], pain_levels[severity])
    
    out = f"""--- SCAN RESULTS ---
    
color                  --->      {color}

abrasion               --->      [{'-' * int(prediction[0] * 10) + ' ' * (10 - int(prediction[0] * 10))}] {classifier[0][0]:.2f}
allergic reaction      --->      [{'-' * int(prediction[1] * 10) + ' ' * (10 - int(prediction[1] * 10))}] {classifier[0][1]:.2f}
blister                --->      [{'-' * int(prediction[2] * 10) + ' ' * (10 - int(prediction[2] * 10))}] {classifier[0][2]:.2f}
bruise                 --->      [{'-' * int(prediction[3] * 10) + ' ' * (10 - int(prediction[3] * 10))}] {classifier[0][3]:.2f}
mosquito / bug bite    --->      [{'-' * int(prediction[4] * 10) + ' ' * (10 - int(prediction[4] * 10))}] {classifier[0][4]:.2f}
burn                   --->      [{'-' * int(prediction[5] * 10) + ' ' * (10 - int(prediction[5] * 10))}] {classifier[0][5]:.2f}
invisible              --->      [{'-' * int(prediction[6] * 10) + ' ' * (10 - int(prediction[6] * 10))}] {classifier[0][6]:.2f}
laceration / cut       --->      [{'-' * int(prediction[7] * 10) + ' ' * (10 - int(prediction[7] * 10))}] {classifier[0][7]:.2f}

--- TREATMENT ---

{treatment}"""
    
    return out

print("DEBUG   --->   loaded some goofy funcitons")
print("DEBUG   --->   if gpu did not blow: finshed loading succesfully")
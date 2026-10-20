const companies = [];

function validateCompany(body) {
    const {name , website , location , notes} = body;

    if(typeof name != "string" || name.trim() === "") {
        return "Company name is required";
    }

    if(name.trim().length > 100) {
        return "Company name must not exceed 100 characters";
    }

    if(website != undefined && typeof website != "string") {
        return "Website must be a string";
    }

    if(location != undefined && typeof location != "string") {
        return "Location must be a string";
    }

    if(notes != undefined && typeof notes != "string") {
        return "Notes must be a string";
    }

    return null;

}

export function listCompanies(req , res) {
    res.json(companies);
}

export function createCompany(req, res) {
    const error = validateCompany(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error
        });
    }

    const { name, website, location, notes } = req.body;

    const newCompany = {
        id: Date.now(),
        name: name.trim(),
        website,
        location,
        notes
    };

    companies.push(newCompany);

    res.status(201).json({
        success: true,
        data: newCompany
    });
}

export function getCompany(req , res) {
    const id = Number(req.params.id);

    const company = companies.find(
        company => company.id === id
    );

    if(!company) {
        return res.status(404).json({
            message : "Company not found"
        });
    }

    return res.status(200).json({
        success: true,
        data: company
    });
}


export function updateCompany(req , res) {
    const id = Number(req.params.id);

    const company = companies.find(
        company => company.id === id
    );

    if(!company) {
        return res.status(404).json({
            success:false , 
            message : "Company not found"
        }
        );
    }

    const error = validateCompany(req.body);

    if(error) {
        return res.status(400).json({
            success: false , 
            message : error
        });
    }

    const {name ,  website , locatino , notes} = req.body; 
    company.name = name.trim();
    company.website = website;
    company.location = locatino;
    company.notes = notes;

    return res.status(200).json({
        success: true,
        data: company
    });
}

export function deleteCompany(req, res) {
    const id = Number(req.params.id);

    const companyIndex = companies.findIndex(
        company => company.id === id
    );

    if (companyIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Company not found."
        });
    }

    companies.splice(companyIndex, 1);

    return res.status(204).send();
}
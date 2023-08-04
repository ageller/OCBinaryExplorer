import React, { useMemo } from 'react';

import { MaterialReactTable } from 'material-react-table';

const CreateMaterialReactTable = ({columns, data}) => {

 
  return (
    <div>
        <MaterialReactTable  columns={columns} data={data}/>;
    </div>
  )
};

export {CreateMaterialReactTable};
